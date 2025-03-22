/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.facebook.react

import com.facebook.react.model.ModelAutolinkingConfigJson
import com.facebook.react.utils.JsonUtils
import com.facebook.react.utils.windowsAwareCommandLine
import java.io.File
import java.math.BigInteger
import java.security.MessageDigest
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import org.gradle.api.GradleException
import org.gradle.api.file.FileCollection
import org.gradle.api.initialization.Settings
import org.gradle.api.logging.Logging
import org.gradle.api.file.DirectoryProperty
import org.gradle.api.file.RegularFileProperty

abstract class ReactSettingsExtension @Inject constructor(val settings: Settings) {

  private val outputFile =
      File(settings.rootDir, "build/generated/autolinking/autolinking.json")
  private val outputFolder =
      File(settings.rootDir, "build/generated/autolinking/")

  private val defaultConfigCommand: List<String> =
      windowsAwareCommandLine(listOf("npx", "@react-native-community/cli", "config")).map {
        it.toString()
      }

  /**
   * Utility function to autolink libraries using an external command as source of truth.
   *
   * This should be invoked inside the `settings.gradle` file, and will make sure the Gradle project
   * is loading all the discovered libraries.
   *
   * @param command The command to execute to get the autolinking configuration. Default is
   *   `npx @react-native-community/cli config`.
   * @param workingDirectory The directory where the command should be executed.
   * @param lockFiles The list of lock files to check for changes (if lockfiles are not changed, the
   *   command will not be executed).
   */
  @JvmOverloads
  public fun autolinkLibrariesFromCommand(
      command: List<String> = defaultConfigCommand,
      workingDirectory: File? = File(settings.rootDir, "../"),
      lockFiles: FileCollection =
          settings.files(
              File(settings.rootDir, "../yarn.lock"),
              File(settings.rootDir, "../package-lock.json"),
              File(settings.rootDir, "../package.json"),
              File(settings.rootDir, "../react-native.config.js")
          )
  ) {
    executeCommand(command, workingDirectory, lockFiles, outputFile)

    if (!outputFile.exists()) {
      // If the file does not exist, the command failed
      return
    }

    val model =
        try {
          JsonUtils.fromJson(outputFile.readText(), ModelAutolinkingConfigJson::class.java)
        } catch (e: Exception) {
          throw GradleException(
              "Could not parse autolinking config file ${outputFile.absolutePath}", e)
        }

    if (model?.dependencies?.isNotEmpty() == true) {
      model.dependencies.forEach { (name, attributes) ->
        val root = attributes.root
        val buildTypes = attributes.buildTypes
        if (root.isNotEmpty()) {
          settings.logger.debug("Including project :$name at project.root = $root")
          settings.includeBuild(root) { spec ->
            spec.dependencySubstitution { handler ->
              handler.substitute(handler.module(attributes.packageName)).using(
                  handler.project(":${attributes.androidPackage}"))
            }
          }
        } else if (buildTypes?.isNotEmpty() == true) {
          settings.logger.debug("Including build types for project: $name")
          settings.includeAarProject(name, attributes.buildTypes)
        } else {
          settings.logger.debug("Including project :$name at project.projectPath = $name")
          settings.include(":$name")
          val projectDir = File(settings.rootDir, "../node_modules/${attributes.packageName}")
          settings.project(":$name").projectDir = projectDir
        }
      }
    }
  }

  /**
   * Executes the command for autolinking, skipping the compute if the lockFiles have not changed.
   *
   * @param command The command to execute.
   * @param workingDirectory The directory where the command should be executed.
   * @param lockFiles The list of lock files to check for changes.
   * @param outputFile The file where the command should store its output.
   */
  private fun executeCommand(
      command: List<String>,
      workingDirectory: File?,
      lockFiles: FileCollection,
      outputFile: File,
  ) {
    if (lockFiles.files.isEmpty()) {
      val logMessage =
          """
          Couldn't find any lockfile we could match. We won't skip running the command.
          We're going to run:
          - command: ${command.joinToString()}
          - working directory: ${workingDirectory?.absolutePath ?: settings.rootDir.absolutePath}
          - output file: ${outputFile.absolutePath}
          """.trimIndent()
      settings.logger.debug(logMessage)
    }

    val checksumHash = checksumForLockFiles(lockFiles)
    val cachedFile = File(outputFolder, "cache-checksum-$checksumHash")

    if (cachedFile.exists()) {
      settings.logger.debug(
          "Lockfiles unchanged (@hash = $checksumHash), skipping command execution.")
      return
    }

    cachedFile.parentFile.mkdirs()
    settings.logger.debug(
        "We're running autolinking as the lockfiles changed. New hash = $checksumHash")
    settings.logger.debug("Executing command ${command.joinToString()}")

    try {
      val processBuilder = ProcessBuilder(command)
      workingDirectory?.let { processBuilder.directory(it) }
      processBuilder.redirectErrorStream(true)
      outputFile.parentFile.mkdirs()
      // To properly handle paths with spaces
      processBuilder.redirectOutput(ProcessBuilder.Redirect.to(outputFile))
      val process = processBuilder.start()
      process.waitFor(5, TimeUnit.MINUTES)
      if (process.exitValue() != 0) {
        settings.logger.error(
            "Command failed with code ${process.exitValue()}, check file ${outputFile.absolutePath}")
      }
      cachedFile.createNewFile()
    } catch (e: Exception) {
      settings.logger.error("Error while executing command:", e)
      throw e
    }
  }

  /**
   * Calculates a checksum of the set of lockfiles to decide if we need to rerun the script or not.
   *
   * @param lockFiles The set of lockfiles to consider.
   * @return a hash of the checksums of the lock files.
   */
  private fun checksumForLockFiles(lockFiles: FileCollection): String {
    val md = MessageDigest.getInstance("MD5")
    lockFiles.files.filter { it.isFile }.forEach { file ->
      settings.logger.debug("Computing MD5 for ${file.absolutePath}")
      md.update(file.readBytes())
    }
    return BigInteger(1, md.digest()).toString(16).padStart(32, '0')
  }

  private fun Settings.includeAarProject(
      projectName: String,
      configurations: Map<String, Map<String, String>>
  ) {
    val rootDir = File(rootDir, "../build/android/${projectName}")
    rootDir.mkdirs()

    // create virtual android library
    File(rootDir, "src/main").mkdirs()
    File(rootDir, "build.gradle").writeText(
        """
            apply plugin: 'com.android.library'
            
            android {
                compileSdkVersion ${configurations["Release"]?.get("compileSdkVersion") ?: "31"}
                namespace "com.facebook.react.library.$projectName"
            }
            
            project.afterEvaluate {
              publishing {
                publications {
                  debug(MavenPublication) {
                    ${
            if (configurations["Debug"] != null) {
              "groupId '${configurations["Debug"]?.get("groupId")}'"
            } else {
              ""
            }}
                    ${
            if (configurations["Debug"] != null) {
              "artifactId '${configurations["Debug"]?.get("artifactId")}'"
            } else {
              ""
            }}
                    ${
            if (configurations["Debug"] != null) {
              "version '${configurations["Debug"]?.get("version")}'"
            } else {
              ""
            }}
                    ${
            if (configurations["Debug"]?.get("artifact") != null) {
              "artifact file('${configurations["Debug"]?.get("artifact")}')"
            } else {
              ""
            }}
                  }
                  release(MavenPublication) {
                    ${
            if (configurations["Release"] != null) {
              "groupId '${configurations["Release"]?.get("groupId")}'"
            } else {
              ""
            }}
                    ${
            if (configurations["Release"] != null) {
              "artifactId '${configurations["Release"]?.get("artifactId")}'"
            } else {
              ""
            }}
                    ${
            if (configurations["Release"] != null) {
              "version '${configurations["Release"]?.get("version")}'"
            } else {
              ""
            }}
                    ${
            if (configurations["Release"]?.get("artifact") != null) {
              "artifact file('${configurations["Release"]?.get("artifact")}')"
            } else {
              ""
            }}
                  }
                }
              }
            }
            """.trimIndent())

    // create the settings file
    File(rootDir, "settings.gradle").writeText(
        """
            rootProject.name = '$projectName'
            """.trimIndent())

    // include the project
    include(":$projectName")
    project(":$projectName").projectDir = rootDir
  }

  companion object {
    val logger = Logging.getLogger(ReactSettingsExtension::class.java)
  }
} 