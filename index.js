const CLIENT_ID = "682265920906-vc0mg2l9hvhv36f566ce2mduev2126lf.apps.googleusercontent.com";
const API_KEY = "AIzaSyBoanGvwf6KXRyvkH_6OJCuhyonksIYvFI";
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar";
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

let tokenClient;
let gapiInited = false;
let gisInited = false;

window.onload = function(){
    let submit = document.querySelector("#send");
    submit.addEventListener("click", function(e){ 
        e.preventDefault();
        if(validarCampos()){
            handleAuthClick();
        }
    });
}

const validarCampos = () =>{
    let regExpMail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    let email = document.querySelector("#email_field").value;
    if(!regExpMail.test(email)){
        alert("Email no válido");
        return false;
    }

    let date = document.querySelector("#date_field").value;
    let dateObj = new Date(date);
    let today = new Date();
    if(today>dateObj){
        alert("La fecha no es válida")
        return false;
    }

    return true;
}

const parseDate = (date,time) =>{
    date = dateObj.toISOString();     //Formato 2022-10-31T17:00:00.000
    date = date.split(":")[0];        //Dejamos solo la parte de la fecha 2022-10-31T17
    date += ":"+time+".000";          //Añadimos hora 
    return date;
}

const createEvent = () => {
    let email = document.querySelector("#email_field").value;
    let time = document.querySelector("#hour_field").value;
    let date = document.querySelector("#date_field").value;
    let dateObj = new Date(date);
    //Para crear la fecha de fin de evento sumamos la duracion a la fecha inicial
    let ms = dateObj.getTime();
    let duration = 300000;
    let finalDateObj = new Date(ms + duration);
    //Adecuamos las fechas al formato
    let finaldDate = parseDate(finalDateObj,time);
    date = parseDate(dateObj,time);

    let event = {
        'summary': 'Meeting',
        'location': 'Google meet',
        'description': 'Test meeting',
        'start': {
        'dateTime': date,
        'timeZone': 'GMT-01:00'
        },
        'end': {
        'dateTime': finaldDate,
        'timeZone': 'GMT-01:00'
        },
        'recurrence': [
        'RRULE:FREQ=DAILY;COUNT=2'
        ],
        'attendees': [
        {'email': 'martisanchis2000@gmail.com'},
        {'email': email}
        ],
        'reminders': {
        'useDefault': false,
        'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
        ]
        }
    };

    let request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
    });
      
    request.execute(function(event) {
        console.log('Event created: ' + event.htmlLink);
    });
}

const gapiLoaded = () => {
    gapi.load('client', intializeGapiClient);
  }

  // Callback after the API client is loaded. Loads the discovery doc to initialize the API.
  async function intializeGapiClient() {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
  }

  // Callback after Google Identity Services are loaded 
  const gisLoaded = () => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', 
    });
    gisInited = true;
  }

  // Sign in the user upon button click 
  const handleAuthClick = () => {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw (resp);
      }
      await createEvent();
    };

    if (gapi.client.getToken() === null) {
      // Prompt the user to select an Google Account and asked for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({prompt: ''});
    }
  }