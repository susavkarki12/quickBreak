/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.facebook.react.utils

import com.android.build.api.variant.AndroidComponentsExtension
import com.android.build.api.variant.Variant
import com.facebook.react.ReactExtension
import com.facebook.react.model.ModelConfiguratorProvider
import com.facebook.react.model.ModelPackageType
import com.facebook.react.utils.ProjectUtils.isHermesEnabled
import com.facebook.react.utils.ProjectUtils.needsCodegenFromPackageJson
import java.io.File
import org.gradle.api.Project
import org.gradle.api.logging.Logger

object NdkConfiguratorUtils {
  /**
   * Utility function that configures the NDK for React Native projects. It will:
   *
   * 1. Setup the NDK handle to be the NDK from AGP, as that's the one that follow the Gradle
   * lifecycle.
   * 2. Configure an exclude for a set of known folders (build/, .cxx/, .cmake/ etc).
   * 3. Setup the CMake and prefab.
   */
  fun configureReactNativeNdk(
      project: Project,
      extension: ReactExtension,
      androidComponentsExtension: AndroidComponentsExtension<*, *, *>,
      logger: Logger
  ) {
    // Immediately return to disable NDK configurator
    logger.info("NdkConfiguratorUtils: disableNativeBuildConfigurer feature detected, skipping NDK configuration")
    return

    /*
    if (extension.disableNativeBuildConfigurer.get()) {
      logger.info("NdkConfiguratorUtils: disableNativeBuildConfigurer feature detected, skipping NDK configuration")
      return
    }

    logger.info("NdkConfiguratorUtils: Configuring NDK for React Native")

    // We want to set the ndk version for users automatically.
    // We compute the appropriate version inside the ReactNativeModuleConfigurator
    androidComponentsExtension
        .finalizeDsl { extension ->
          logger.info("NdkConfiguratorUtils: Setting NDK Version...")
          extension.ndkVersion =
              when {
                extension.ndkVersion.isNullOrEmpty() ->
                    project.findProperty("android.ndkVersion") as? String
                        ?: ModelConfiguratorProvider.getDefaultNdkVersion(
                            project = project, modelPackageType = ModelPackageType.HEWMODULES)
                else -> extension.ndkVersion
              }
          logger.info("NdkConfiguratorUtils: NDK version set to ${extension.ndkVersion}")
          extension.externalNativeBuild.cmake.path =
              File("${extension.buildDir}/generated/rncli/cmake-config/CMakeLists.txt")
        }

    androidComponentsExtension.beforeVariants { variantBuilder ->
      // We attach a callback for all of them but we filter in the beforeVariantHandler.
      variantBuilder.registerGeneratedCMakeConfigTask { v ->
        // This call used to be inside ReactApplicationBuildTypeModelConfigurator, but it has been moved here
        // as it's better to handle the logic from a unique place. The configurator relies on data from the packageJson
        // which is stale in Variant API, and would lead to wrong values.
        val needsCodegenFromPackageJson =
            needsCodegenFromPackageJson(extension.root.get().asFile) ||
                isHermesEnabled(
                    extension.root.get().asFile, variantBuilder.buildType, extension.hermesEnabled)
        if (needsCodegenFromPackageJson) {
          // If we are running codegen, we need to exclude various build folders from being
          // packaged in the resulting APK.
          variantBuilder.packaging.jniLibs.excludes.add("**/libfbjni.so")

          // b/295348718 - This was applied to all apps but it was moved during the New Arch Refactor
          // It's fine to run this here as these are patterns for directories we don't want inside the APK.
          // NOTE: Let's be defensive here, we don't need to crash the build if one of those folders is missing.
          val cxxRoot = File(extension.codegenDir.get().asFile.parentFile, ".cxx")
          if (cxxRoot.exists()) {
            variantBuilder.packaging.jniLibs.excludes.add("**/libc++_shared.so")
            variantBuilder.packaging.jniLibs.excludes.add("**/libfabricjni.so")
            variantBuilder.packaging.jniLibs.excludes.add("**/libreactnativeblob.so")
            variantBuilder.packaging.jniLibs.excludes.add("**/libreactnativejni.so")
          }

          beforeVariantHandler(v, extension, project, logger)
        }
      }
    }
    */
  }

  /**
   * This method was extracted to make it more test-friendly. It wouldn't be directly testable if
   * kept inside the withVariants due to how the KMP plugins are configured.
   */
  private fun beforeVariantHandler(
      variant: Variant,
      extension: ReactExtension,
      project: Project,
      logger: Logger
  ) {
    val buildDir = extension.root.file("android/app/build").get().asFile.absolutePath
    variant.packaging.jniLibs.excludes.add("**/folly_runtime/**")
    variant.packaging.jniLibs.excludes.add("**/glog/**")
    variant.packaging.jniLibs.excludes.add("**/react_nativemodule_core/**")
    variant.packaging.jniLibs.excludes.add("**/reactnativejni/**")

    try {
      // If the .cxx directory exists, exclude it as well.
      val cxxDir = File(buildDir, ".cxx")
      if (cxxDir.exists()) {
        variant.packaging.jniLibs.excludes.add("**/build/.cxx/**")
      }
    } catch (e: Exception) {
      logger.warn("Failed to exclude .cxx directory from packaging", e)
    }

    try {
      // If the cmake directory exists, exclude it as well.
      val cmakeDir = File(buildDir, ".cmake")
      if (cmakeDir.exists()) {
        variant.packaging.jniLibs.excludes.add("**/build/.cmake/**")
      }
    } catch (e: Exception) {
      logger.warn("Failed to exclude .cmake directory from packaging", e)
    }
  }
} 