import './App.css';
import Inputs from './components/Inputs';
import TopButtons from './components/TopButtons';
import TimeAndLocation from './components/TimeAndLocation';
import TemperatureAndDetails from './components/TemperatureAndDetails';
import Forecast from './components/Forecast';
import getFormattedWeatherData from './Services/weatherService';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MapContainer from './components/MapContainer';
import DrawBarChart from './components/DrawBarChart';
import DrawLineChart from './components/DrawLineChart';
import ThreeHourlyForecastForFiveDays from './components/ThreeHourlyForecastForFiveDays';

function App() {

  const [query, setQuery] = useState({q:'london'})

  const [units, setUnits ]  = useState('metric')

  const [weather, setWeather] = useState(null)
  

  useEffect(() =>{
    const fetchWeather  = async() =>{
      //const message = query.q? query.q :'current location.'

     // toast.info("Fetching weather for "+ message)
       await getFormattedWeatherData({...query, units}).then(
        (data) => {
          toast.success(`Successfully fetched weather for ${data.name}, ${data.country}`)
          setWeather(data);

          const threshold = units ==='metric'?0:32

          if (data.temp <=threshold){
              toast.info('Look! It is freezing out here')
          }
          
       });
      
    };
     fetchWeather();
  },[query, units]);

  const formatBackground =() =>{
    if (!weather) return ' from-cyan-200 to-sky-500 '
    const threshold = units ==='metric' ? 20 : 60

    if(weather.temp <= threshold) return 'from-cyan-400 to-blue-700 '

    return 'from-yellow-700 to-orange-700'
      
  }
 
  return (
    <div className= "max-w-screen-xl ">

      <div className=" max-w-screen-xl grid grid-cols-2 grid-rows-1">
        <div className={` grid row-start-1 row-end-1 col-start-1 col-end-1  mx-4  mt-4 py-5 px-32  h-fit shadow-xl bg-gradient-to-br ${formatBackground()}`}>
            <TopButtons setQuery={setQuery}/>
            <Inputs setQuery={setQuery} units={units} setUnits={setUnits}/>
                { weather &&  (
                <div> 
                    <TimeAndLocation weather ={weather}/>
                    <TemperatureAndDetails weather ={weather} units={units}/> 
                    <Forecast title="hourly forecast" items={weather.hourly} />
                    <Forecast title="daily forecast" items={weather.daily} />                 
                  </div>
              )}
        </div>

        <div className= {`grid col-start-2 col-end-2 mx-4 max-w-screen-xl mt-4 py-5 px-5  shadow-xl shadow-gray-400 bg-gradient-to-br ${formatBackground()}`}>
        { weather &&  (
        <div id='map2'> 
            { <MapContainer  data={weather} color ={formatBackground()}/> }
          </div>

        )}
      </div>

      </div> 

      <div className= {` grid  row-start-2 row-end-2  col-span-2 max-w-screen-xl mx-4  mt-4 py-5 px-10 h-fit shadow-xl  shadow-gray-400  bg-gradient-to-br ${formatBackground()}`}>
        { weather &&  (
            <div  id='lineGraph3'> 
                { <DrawLineChart  data={weather}
                                  width={"1016"}
                                  height={"400"}  
                                  color ={formatBackground()}
                                  DailyTemp ={false}
                                   HourlyTemp={true}
                                   id ={'lineGraph3'}/>} 
                   
                </div>
        )}
        </div>
        

        <div className= {` grid  row-start-3  row-end-3 col-span-2 max-w-screen-xl mx-4  mt-4 py-5 px-10 h-fit shadow-xl  shadow-gray-400  bg-gradient-to-br ${formatBackground()}`}>
          { weather &&  (
            <div id='graph3'> 
                { <DrawBarChart  data={weather} 
                                    DailyTemp={false} 
                                    HourlyTemp={true}
                                  width={"1016"}
                                  height={"400"}  
                                  color ={formatBackground()}
                                  id ={'graph3'}
                                  />} 
                   
                </div>
        )}
        </div>

      <div  className=" max-w-screen-xl grid grid-cols-2 grid-rows-1">
        <div className= {` grid row-start-4 row-end-4 col-start-1 col-end-1 mx-4  mt-4 py-5 px-10 h-fit shadow-xl  shadow-gray-400  bg-gradient-to-br ${formatBackground()}`}>
          { weather &&  (
              <div  id='lineGraph2'> 
               { <DrawLineChart  data={weather}
                                  width={"500"}
                                  height={"400"}  
                                  color ={formatBackground()}
                                  DailyTemp ={true}
                                  HourlyTemp={false}
                                  id ={'lineGraph2'}
                                  />} 
                    
                  </div>
          )}
          </div>

        <div className= {` grid row-start-4 row-end-4 col-start-2 col-end-2  mx-4  mt-4 py-5 px-10 h-fit shadow-xl  shadow-gray-400  bg-gradient-to-br ${formatBackground()}`}>
          { weather &&  (
            <div id='graph2'> 
               { <DrawBarChart  data={weather} DailyTemp={true} HourlyTemp={false}
                                  width={"500"}
                                  height={"400"}  
                                  color ={formatBackground()}
                                  id ={'graph2'}
                     />} 
                   
                </div>
        )}
        </div>
      </div>
     
      
      <div className= {`grid  grid-start-row-2 grid-end-row-2 grid-col-span-2 mx-4 max-w-screen-xl mt-4 py-5 px-32   h-fit shadow-xl shadow-gray-400 bg-gradient-to-br ${formatBackground()}`}>
        { weather &&  (
        <div> 
            { <ThreeHourlyForecastForFiveDays  title="3- hourly forecast for next five days" items ={weather.list} header ={weather.fiveDayRowHeader}/> }
          </div>

        )}
      </div>
      
        <ToastContainer autoClose={5000} theme='colored' newestOnTop ={true}/> 
    </div>
    
  );
}

export default App;
