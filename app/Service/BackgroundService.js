import BackgroundService from "react-native-background-actions";

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const backgroundTask = async () => {
    const a=1
    for(i= a; i<100; i++){
        console.log("App is running in BG...."+ i)
        await sleep(5000);
    }
    
};

const options = {
    taskName: "MyApp",
    taskTitle: "Running in background",
    taskDesc: "App is running",
    taskIcon: { name: "ic_launcher", type: "mipmap" },
    linkingURI: "myapp://",
};

const startBackgroundService = async () => {
    await BackgroundService.start(backgroundTask, options);
    BackgroundService.updateNotification({ taskDesc: "Still running..." });
};

const stopBackgroundService = async () => {
    await BackgroundService.stop();
};

export { startBackgroundService, stopBackgroundService };