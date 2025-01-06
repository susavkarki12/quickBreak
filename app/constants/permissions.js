import RNDrawOverlay from 'react-native-draw-overlay';

// TODO: What to do with the module?


const overlay=()=>{
    RNDrawOverlay.askForDispalayOverOtherAppsPermission()
	     .then(res => {
            if(res){
                console.log("Permission granted")
            }else{
                console.log("Permission denied")
            }
	     })
	     .catch(e => {
            console.log("PErmission error", e)
	     })
}

export default overlay;