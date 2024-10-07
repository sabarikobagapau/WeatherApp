import React, { Component } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet, Dimensions,
  TouchableOpacity, Alert, ActivityIndicator, Keyboard
} from 'react-native';

const { width, height } = Dimensions.get('window');

class WeatherApp extends Component {
  state = {
    city: '',
    forecast: [],
    isLoading: false,
  };

  handleSearch = async () => {
    Keyboard.dismiss();
    this.setState({ isLoading: true });
    try {
      const locationData = await this.fetchLocationData();
      if (locationData.length > 0) {
        const { lat, lon } = locationData[0];
        await this.fetchWeatherData(lat, lon);
      } else {
        this.setState({ forecast: [] });
        Alert.alert('No location found');
      }
    } catch (error) {
      Alert.alert('Error fetching data');
    } finally {
      this.setState({ isLoading: false });
    }
  };

  fetchLocationData = async () => {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${this.state.city},IND&limit=5&appid=1635890035cbba097fd5c26c8ea672a1`
    );
    return response.json();
  };

  fetchWeatherData = async (lat, lon) => {
    const weatherResponse = await fetch(
      `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=1635890035cbba097fd5c26c8ea672a1&units=metric`
    );
    if (!weatherResponse.ok) {
      return
    }
    const weatherData = await weatherResponse.json();
    const forecastArray = this.processWeatherData(weatherData);
    this.setState({ forecast: forecastArray.slice(0, 5) });
  };

  processWeatherData = (weatherData) => {
    const forecast = {};
    weatherData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!forecast[date]) {
        forecast[date] = {
          id: date,
          date,
          minTemp: item?.main?.temp_min,
          maxTemp: item?.main?.temp_max,
          pressure: item?.main?.pressure,
          humidity: item?.main?.humidity,
        };
      } else {
        forecast[date].minTemp = Math.min(forecast[date].minTemp, item.main.temp_min);
        forecast[date].maxTemp = Math.max(forecast[date].maxTemp, item.main.temp_max);
      }
    });
    return Object.values(forecast);
  };

  renderItem = ({ item }) => (
    <View style={styles.forecastContainer}>
      <View style={styles.viewBox}>
        <Text style={styles.date}>Date: {item.date}</Text>
      </View>
      <View style={[styles.viewBox, styles.temperatureHeader]}>
        <Text style={styles.label}>Temperature</Text>
      </View>
      {this.renderTemperatureRow(item)}
      {this.renderWeatherDetail('Pressure', item.pressure)}
      {this.renderWeatherDetail('Humidity', item.humidity)}
    </View>
  );

  renderTemperatureRow = (item) => (
    <>
      <View style={styles.row}>
        <View style={styles.rowBoxView}>
          <Text style={styles.label}>Min</Text>
        </View>
        <View style={styles.rowBoxView}>
          <Text style={styles.textValue}>{item.minTemp}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.rowBoxView}>
          <Text style={styles.label}>Max</Text>
        </View>
        <View style={styles.rowBoxView}>
          <Text style={styles.textValue}>{item.maxTemp}</Text>
        </View>
      </View>
    </>
  );

  renderWeatherDetail = (label, value) => (
    <View style={styles.row}>
      <View style={[styles.rowBoxView, styles.detailBox]}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={[styles.rowBoxView, styles.detailBox]}>
        <Text style={styles.textValue}>{value}</Text>
      </View>
    </View>
  );

  render() {
    const { city, forecast, isLoading } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.header}>Weather in your city</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter city name"
          value={city}
          onChangeText={(city) => this.setState({ city })}
        />
        <TouchableOpacity style={styles.button} onPress={this.handleSearch}>
          <Text style={styles.searchText}>Search</Text>
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" style={styles.activityIndicator} />
        ) : (
          <FlatList
            data={forecast}
            style={styles.forecastList}
            keyExtractor={(item) => item.id}
            renderItem={this.renderItem}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: width * 0.05,
    flex: 1,
  },
  header: {
    fontSize: width * 0.07,
    textAlign: 'center',
    marginBottom: height * 0.02,
    color: '#ff6600',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: height * 0.015,
    marginBottom: height * 0.02,
    fontSize: width * 0.045,
  },
  forecastContainer: {
    backgroundColor: '#eee',
    marginVertical: height * 0.01,
    width: width * 0.7,
    alignSelf: 'center',
    borderWidth: 0.8,
    borderColor: '#000',
  },
  date: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#000',
  },
  rowBoxView: {
    alignItems: 'center',
    width: '50%',
    backgroundColor: '#C1C1C1',
    borderWidth: 0.6,
    borderColor: 'black',
    paddingVertical: 5,
  },
  label: {
    fontWeight: 'bold',
    fontSize: width * 0.05,
    color: '#333',
  },
  textValue: {
    fontSize: width * 0.05,
    color: '#333',
  },
  button: {
    width: width / 3.5,
    height: 40,
    backgroundColor: '#ff6600',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  viewBox: {
    backgroundColor: '#ff6600',
    borderWidth: 0.8,
    borderColor: 'black',
    alignItems: 'center',
    paddingVertical: 5,
  },
  row: {
    flexDirection: 'row',
  },
  activityIndicator: {
    position: 'absolute',
    top: height / 2 - 20,
    left: width / 2 - 20,
  },
  temperatureHeader: {
    backgroundColor: '#C1C1C1',
  },
  detailBox: {
    backgroundColor: '#fff',
  },
  forecastList: {
    marginTop: 20,
  },
});

export default WeatherApp;
