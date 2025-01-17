import {Entypo, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import getUsageData from "../Service/UsageStatsService";
const size=45
const Apps=[
    {
        app: "Facebook",
        data: "com.facebook.katana",
        icon: <Entypo name="facebook" size={size} color="#1877F2" />,
        color: "blue"
    },
    {
        app: "Chrome",
        data: "com.android.chrome",
        icon: <FontAwesome6 name="chrome" size={size} color="black" />,
        color: "#5F6368"
    },
    {
        app: "Whatsapp",
        data: "com.whatsapp",
        icon: <FontAwesome6 name="square-whatsapp" size={size} color="#25d366" />,
        color: "#25d366"
    },
    {
        app: "Messenger",
        data: "com.facebook.orca",
        icon: <FontAwesome5 name="facebook-messenger" size={size} color="#0078FF" />,
        color: "blue"
    }
]

export default Apps