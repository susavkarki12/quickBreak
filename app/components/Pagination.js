import { StyleSheet, View } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const Pagination = ({ currentIndex, total }) => {
  return (
    <View style={paginationStyles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            paginationStyles.dot,
            currentIndex === index && paginationStyles.activeDot,
          ]}
        />
      ))}
    </View>
  );
};

const paginationStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    bottom: hp('2%'),
    alignSelf: "center",
    
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "gray",
    margin: 8,
  },
  activeDot: {
    width: 50,
    backgroundColor: "white",
  },
});

export default Pagination;