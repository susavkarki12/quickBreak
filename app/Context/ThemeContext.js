import { View, Text } from 'react-native'
import { createContext,useEffect,useState} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

 export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: ()=>{},
 });
 export const ThemeProvider=({children})=>{
    const [isDarkMode,setIsDarkMode]=useState(false);
    useEffect(() => {
        const fetchTheme = async () => {
          const theme = await AsyncStorage.getItem('theme');
          if (theme === 'dark') {
            setIsDarkMode(true);
          }
        };
    
        fetchTheme();
      }, []);
      const toggleTheme = async () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
      };
      return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
          {children}
        </ThemeContext.Provider>
      );
    };


 
  
