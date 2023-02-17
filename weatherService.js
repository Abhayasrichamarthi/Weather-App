import {DateTime} from "luxon" ;
const API_KEY="635b96d7eef039c7ed67ddb7a469541d";
const BASE_URL ="https://api.openweathermap.org/data";


const getWeatherData =(infoType, searchParams) =>{
    const url = new URL(BASE_URL+"/"+infoType);
    url.search = new URLSearchParams({...searchParams , appid: API_KEY

    });

    return fetch(url).then((res)=>res.json());
};

const  formatForecastWeather =(data)=>{

    let {timezone, daily, hourly} = data;
    const dailyData = data.daily;
    const hourlyData = data.hourly;
    daily = daily.slice(1,6).map( d =>{

        return {
            title : formatToLocalTime(d.dt, timezone, 'ccc'),
            temp: d.temp.day,
            icon: d.weather[0].icon

        }
    });

    hourly = hourly.slice(1,6).map( d =>{

        return {
            title : formatToLocalTime(d.dt, timezone, 'hh:mm a'),
            temp: d.temp,
            icon: d.weather[0].icon
        }
    });

   let dailyGraphData = dailyData.map( d =>{

        return {
            title : formatToLocalTime(d.dt, timezone, 'dd LLL'),
            temp: d.temp.day,
            icon: d.weather[0].icon

        }
    });

    let hourlyGraphData = hourlyData.slice(1,13).map( d =>{

        return {
            title : formatToLocalTime(d.dt, timezone, 'hh:mm a'),
            temp: d.temp,
            icon: d.weather[0].icon
        }
    });
    
    return {timezone, daily, hourly, dailyGraphData, hourlyGraphData}

};


const getColInd =(x) =>{
        
    let col_ind =1;

    switch (x){
        case "00":
            col_ind =2;
            break;
        case "03":
            col_ind =3;
            break;
        case "06":
            col_ind =4;
            break;
        case "09":
            col_ind =5;
            break;
        case "12":
            col_ind =6;
            break;
        case "15":
            col_ind =7;
            break;
        case "18":
            col_ind =8;
            break;
        case "21":
            col_ind =9;
            break;
        default:
            col_ind ="No Value";
    }

    return col_ind;
}

const getRowHeaderForFiveDayForecast =(list) =>{

    let rowHeader ={}
    let rowHeaderArr =[]
    let rowHeaderCheckObj ={}
    let title ="";
    let cur_ind =0;
    let obj ={}
    let rowHeaderobj ={}
    for (let ind in list) {
       
        obj = list[ind];
        title = obj.title;
        if(!rowHeaderCheckObj.hasOwnProperty(title)){
            cur_ind =cur_ind+1;
            rowHeaderCheckObj[title] =cur_ind;
            rowHeaderobj ={};
            rowHeaderobj.id =cur_ind;
            rowHeaderobj.title = title;
            rowHeaderArr.push(rowHeaderobj)
        }
    }
    rowHeader["fiveDayRowHeader"] =rowHeaderArr;
    return rowHeader;
}

const getRowHeaderArrForFiveDayForecast =(list) =>{

    let rowHeader ={}
    let rowHeaderArr =[]
    let rowHeaderCheckObj ={}
    let title ="";
    let cur_ind =0;
    let obj ={}
    let rowHeaderobj ={}
    for (let ind in list) {
       
        obj = list[ind];
        title = obj.title;
        if(!rowHeaderCheckObj.hasOwnProperty(title)){
            cur_ind =cur_ind+1;
            rowHeaderCheckObj[title] =cur_ind;
            rowHeaderArr.push(title)
        }
    }
    rowHeader["fiveDayRowHeader"] =rowHeaderArr;
    return rowHeader;
}

  const  formatForecastFiveDayWeatherForTable =(data)=>{
    
    let {timezone,list} = data;
    
    timezone = data.city.timezone;

    let prevTitle ="";
    let prevRowIndex=1;
    console.log(prevTitle)

    list = data.list.map( d=> {
       
        let titleObj =formatToLocalTimeWithoutZone(d.dt_txt, 'dd LLL');
        prevRowIndex = titleObj !== prevTitle? prevRowIndex+1 :prevRowIndex;
        prevTitle = titleObj !== prevTitle? titleObj :prevTitle;
        console.log(titleObj);
        return {
            title : titleObj,
            hour : formatToLocalTimeWithoutZone(d.dt_txt, 'hh:mm a'),
            temp: d.main.temp,
            icon: d.weather[0].icon,
            col : formatToLocalTimeWithoutZone(d.dt_txt, 'HH'),
            feels_like : d.main.feels_like,
            description : d.weather[0].main,
            dt_txt :formatToLocalTimeWithoutZone(d.dt_txt, 'dd LLL hh a'),
            col_index : getColInd(formatToLocalTimeWithoutZone(d.dt_txt, 'HH')),
            row_index : prevRowIndex
        }
        
    })

    return {timezone, list}
};




const formatCurrentWeather =(data) =>{
    const {
        coord :{ lat, lon},
        main :{ temp, feels_like, temp_min, temp_max, humidity},
        name,
        dt,
        sys:{ country, sunrise, sunset},
        weather,
        wind :{ speed}
    
    } = data

    const {main:details ,icon} = weather[0]

    return {
        lat, lon , temp, feels_like, temp_min, temp_max, humidity,
         name , dt, country, sunrise, sunset, details,icon, speed
    }
}

const getFormattedWeatherData = async(searchParams) =>{
    const formattedCurrentWeather =  await getWeatherData('2.5/weather',searchParams).then(formatCurrentWeather)

    const {lat , lon} = formattedCurrentWeather

     const formattedForecastWeather = await getWeatherData('3.0/onecall', {
         lat, lon, exclude:"minutely",units:searchParams.units
     }).then(formatForecastWeather)
    
    const formattedForecastFiveDayWeather = await getWeatherData('2.5/forecast', {
        lat, lon,units:searchParams.units
    }).then(formatForecastFiveDayWeatherForTable)

  
    const fiveDayRowHeader = getRowHeaderArrForFiveDayForecast(formattedForecastFiveDayWeather.list);

    return { ...formattedCurrentWeather, ...formattedForecastWeather, ...formattedForecastFiveDayWeather, ...fiveDayRowHeader};
};

const formatToLocalTime = (secs, zone, format = "cccc, dd LLL yyyy' | Local Time: 'hh:mm a") => DateTime.fromSeconds(secs).setZone(zone).toFormat(format);

const formatToLocalTimeWithoutZone = (secs,  format = "cccc, dd LLL yyyy' | Local Time: 'hh:mm a") => DateTime.fromSQL(secs).toFormat(format);


const iconUrlFromCode = (code) => `http://openweathermap.org/img/wn/${code}@2x.png`;


export default getFormattedWeatherData; 

export {formatToLocalTime , iconUrlFromCode}