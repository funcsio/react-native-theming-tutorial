import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  FlatList,
  View,
  Image,
  useWindowDimensions,
  useColorScheme,
} from 'react-native';

const themes = colorScheme =>
  colorScheme === 'dark'
    ? {
        textColor: '#fff',
        headerColor: '#fff',
        backgroundColor: '#000',
        cardColor: '#222',
      }
    : {
        textColor: '#222',
        headerColor: '#000',
        backgroundColor: '#fff',
        cardColor: '#eef',
      };

const ThemeContext = React.createContext({});

const ThemeProvider = props => {
  const [theme, setTheme] = useState(themes());

  const colorScheme = useColorScheme();

  useEffect(() => {
    setTheme(themes(colorScheme));
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={theme}>
      {props.children}
    </ThemeContext.Provider>
  );
};

// HOC
const withTheme =
  Component =>
  ({...props}) => {
    const theme = React.useContext(ThemeContext);
    return <Component theme={theme} {...props} />;
  };

const ListItem = ({image, name, location, flexCols, theme}) => {
  const styles = StyleSheet.create({
    root: {
      flex: 1 / flexCols,
      padding: 10,
    },
    container: {
      flex: 1,
      overflow: 'hidden',
      backgroundColor: theme.cardColor,
      borderRadius: 10,
    },
    name: {
      fontSize: 14,
      color: theme.textColor,
      fontWeight: '700',
    },
    location: {
      fontSize: 10,
      fontStyle: 'italic',
      color: theme.textColor,
      fontWeight: '700',
    },
    image: {
      aspectRatio: 1,
      resizeMode: 'cover',
    },
    contentContainer: {
      padding: 5,
    },
  });
  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Image source={{uri: image}} style={styles.image} />
        <View style={styles.contentContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.location}>{location.name}</Text>
        </View>
      </View>
    </View>
  );
};

const ThemedListItem = withTheme(ListItem);

const App = ({theme}) => {
  const [data, setdata] = useState([]);
  const [nextPageURL, setnextPageURL] = useState(null);

  const getData = useCallback(async () => {
    const apiEndPoint = nextPageURL
      ? nextPageURL
      : 'https://rickandmortyapi.com/api/character';
    fetch(apiEndPoint)
      .then(response => response.json())
      .then(resp => {
        setnextPageURL(resp.info.next);
        setdata(prevData => {
          return [...prevData, ...resp.results];
        });
      });
  }, [nextPageURL]);

  useEffect(() => {
    (async () => {
      getData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const window = useWindowDimensions();
  const numCols = Math.ceil(window.width / 220);

  const styles = StyleSheet.create({
    root: {
      backgroundColor: theme.backgroundColor,
    },
    heading: {
      fontSize: 30,
      color: theme.headerColor,
      fontWeight: '400',
      marginHorizontal: 10,
      marginVertical: 10,
    },
  });

  return (
    <SafeAreaView>
      <View style={styles.root}>
        <Text style={styles.heading}>Characters</Text>
        <FlatList
          onEndReached={getData}
          numColumns={numCols}
          key={numCols}
          data={data}
          renderItem={({item}) => {
            return <ThemedListItem {...item} flexCols={numCols} />;
          }}
          keyExtractor={(item, idx) => `${item.name}_${idx}`}
        />
      </View>
    </SafeAreaView>
  );
};
const ThemedApp = withTheme(App);

const Root = () => {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
};

export default Root;
