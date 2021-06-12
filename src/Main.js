import React, {useState,useEffect} from 'react';
import './mysass.scss';
import axios from 'axios';
import {Loader, LoaderOptions} from 'google-maps';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import { TableHead, TableRow } from '@material-ui/core';
//import Maps from './Maps';

//global stores
let map = null;
let markers = [];
let google = null;
let flightPath = null;
//to ensure fetchdata only happens once;
var k = false;

function Main() {

    const config = require('./config.json')

    const APIKEY = config.APIKEY;
    const [loading,setLoading] = useState(true);
    const [Events,setEvents] = useState([]);
    const [EventInfo,setEventInfo] = useState("Please select an event");
    const [PageNumber, setPageNumber] = useState(1);
    let ginfowindow = null;

    const fetchData = ()=> {
 
        if (!k) {

        k = true;

    
        var url = 'https://app.ticketmaster.com/discovery/v2/events?apikey=c0GI1dStxGctf0AA9Rd1MAh7IUswe0KK&sort=date,asc&attractionId=K8vZ9175hx7&locale=en-us&apikey=' + APIKEY;

        axios.get(
            url
          ).then((queryResult)=>{

           
            setEvents(queryResult.data._embedded.events)


          }).catch((err)=>{
              console.log(err);
          });

          //need to figure out why this is not loading on page refresh but loading on rerender!!!!
          
          
        //queryResult.data ? setEvents(queryResult.data._embedded.events): console.log('null');



        }

        

    }

    /*
    This paging function is not working because currently the ticketmaster API is not returning anything past the first page or results.

    https://app.ticketmaster.com/discovery/v2/events?apikey=c0GI1dStxGctf0AA9Rd1MAh7IUswe0KK&attractionId=K8vZ9175jS0&locale=*&page=2

    returns w/o  _embedded field.


    */
    function fetchMoreData() {

        let page = PageNumber;

        page += 1;

        let url = 'https://app.ticketmaster.com/discovery/v2/events?apikey=c0GI1dStxGctf0AA9Rd1MAh7IUswe0KK&page='+page+'&sort=date,asc&attractionId=K8vZ9175hx7&locale=en-us&apikey=' + APIKEY;

        axios.get(
            url
          ).then((queryResult)=>{

           var e = Events;
           console.log(queryResult)
            e.push(...queryResult.data._embedded.events);

            console.log(e.length)
            setEvents(e)


          }).catch((err)=>{
              console.log(err);
          });
    }

    const loadmaps = async ()=>{
        console.log('loading maps')
        const loader = new Loader('AIzaSyAg4qCH5QMWTYG1AQrX2jWV4skWX_xWnIU', {})
 
        google = await loader.load();
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 38.850033, lng: -97.6500523},
            zoom: 4.0,
        });
        
        if (Events.length > 1) {
          
            for (let i in Events) {
                let event = Events[i];
               
                let venueloc = event._embedded.venues[0].location;
                //needed to convert the given lat/lng to a google maps version of lat/lng
                let latlng = new google.maps.LatLng(venueloc.latitude,venueloc.longitude)
                let marker = new google.maps.Marker({
                    position: latlng,
                    map,
                    title: event.name,
                  });
                  markers.push({id:event.id,marker:marker});
                  
                  //using this to add a readable date
                  var date = new Date(event.dates.start.localDate);
                  let info = event.info ? event.info: '';
                  let content = `
                    <div onClick=eventParse(event) style="border-bottom:1px solid black">
                        <img width=50px src="`+event.images[0].url+`"></img>
                        <h3>`+event.name+`</h3>
                        <div>
                            <p>`+event._embedded.venues[0].city.name+`,`+event._embedded.venues[0].state.stateCode+`</p>
                        </div>
                    </div>
                    <div style="max-width:200px">
                    <table>
                        <tr>
                            <td>&#128197</td>
                            <td>
                                `+date.toDateString()+`
                            </td>
                        </tr>
                        <tr>
                            <td>&#128336</td>
                            <td>
                                `+event.dates.start.localTime+`
                            </td>
                        </tr>
                    </table>
                    </div>
                  `
    
               
                let infowindow = new google.maps.InfoWindow({
                    content: content,
                  });
                  google.maps.event.addListener(marker, "click", () => {
                    
                    //added this shim to handle closing infowindows if they are open
                    if (ginfowindow) {
                        ginfowindow.close()
                        ginfowindow = infowindow;
                        infowindow.open(map, marker);
                    } else {
                        infowindow.open(map, marker);
                        ginfowindow = infowindow;
                    }
                    
                  });

                  //removed hover because it was buggy
                  /*google.maps.event.addListener(marker, "mouseover", () => {
                    infowindow.close()
                    infowindow.open(map, marker);
                  });
                  google.maps.event.addListener(marker, "mouseout", () => {
                    infowindow.close()
                  });*/
    
    
                
            }

            //using this timeout function to keep loading screen while markers load
            setTimeout(function(){setLoading(false);},500)
            

        }
       

    }
    //the detail section below the list
    function details(event) {
        return (
            <div style={{fontSize:".8rem"}}>
                <div>
                    <h3>{event.name}</h3>
                    <p>{new Date(event.dates.start.localDate).toDateString()} at the {event._embedded.venues[0].name}</p>
                </div>
                <div>
                    <div style={{display:"inline-block",textAlign:"center"}}>
                            {event._embedded.attractions.map(function(ele) {
                                return (
                                <div style={{display:"inline-block",marginRight:"10px",textAlign:"center"}}>
                                <div style={{marginRight:"auto",marginLeft:"auto",backgroundSize:"cover",backgroundImage:`url(`+ele.images[0].url+`)`,height:"50px",width:"50px",borderRadius:"50%"}}>

                                </div>
                                <center>
                                <p style={{fontSize:".8rem"}}>{ele.name}</p>
                                </center>
                                
                                </div>)
                            })}
                    </div>
                    <div style={{display:"inline-block",marginLeft:"30px"}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>City</TableCell>
                                    <TableCell>State</TableCell>
                                    <TableCell>URL</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>{event._embedded.venues[0].city.name}</TableCell>
                                    <TableCell>{event._embedded.venues[0].state.stateCode}</TableCell>
                                    <TableCell><a target="__blank" href={event.url}>Link</a></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                   
                    
                </div>
            </div>
        )
    }
    //handles the click event of event from list
    const eventParse = function(event) {
       var path = [];
       if (flightPath) {
        flightPath.setMap(null);
       }
        for (var i in markers) {

            var marker = markers[i];
            var lat = marker.marker.position.lat();
            var lng = marker.marker.position.lng()
            path.push(new google.maps.LatLng(lat,lng))

            if (event.id === marker.id) {
                var panPoint = new google.maps.LatLng(lat, lng);
                map.setZoom(4.5)
                map.panTo(panPoint);
                break;
            }

        }

         flightPath = new google.maps.Polyline({
            path: path,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2
          });
        
          flightPath.setMap(map);


        setEventInfo(details(event));
    }

    

    //detect scroll to the bottom of event list
    function handleScroll(e) {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom) {
            fetchMoreData()
        }
    }

    useEffect(()=>{
        //these two functions are run each time that Events is updated.
        //the fetchdata is set to only run once - while the loadmaps function catches the updated Events 
        //state that occurs after fetchData
        fetchData();
        loadmaps();
    },[Events])

    return (
        <>
        <div style={{display:loading ? 'block' : 'none',textAlign:"center"}} id="loading" class="blob red">
            <h2 class="pulsate">Loading..</h2>
        </div>
        <div class="grid-container" style={{display:!loading ? 'grid': 'none'}}>
            <div class="item1" id="header">
                <center>
                    <h1>Kings of Leon upcoming Tour Dates</h1>
                </center>
            </div>
            <div class="item2">
                <div id="map" style={{height:"400px"}}></div>
            </div>
            <div class="item3" id="listresults" onScroll={handleScroll}>
                <TableContainer>
                <Table size="small" >
                    <TableHead>
                        <TableRow>
                            <TableCell >Name</TableCell>
                            <TableCell>Venue</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Location</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Events.map(function(ele,index){
                           return( <TableRow onClick={()=>{eventParse(ele)}} key={index} hover="true" style={{cursor:"pointer"}}>
                                <TableCell style={{fontSize:'.8rem'}}>{ele.name}</TableCell>
                                <TableCell size="small" style={{fontSize:'.8rem'}}>{ele._embedded.venues[0].name}</TableCell>
                                <TableCell style={{fontSize:'.6rem'}} >{ele.dates.start.tbd?ele.dates.start.tbd:new Date(ele.dates.start.localDate).toDateString()}</TableCell>
                                <TableCell>{ele._embedded.venues[0].city.name},{ele._embedded.venues[0].state.stateCode}</TableCell>
                            </TableRow>
                           )
                        })}
                    </TableBody>
                </Table>
                </TableContainer>
            </div>
            <div class="item4">{EventInfo}</div>
        </div>
        </>
    )

}

export default Main