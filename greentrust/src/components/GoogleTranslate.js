import React from "react";
import { useEffect } from "react";


const GoogleTranslate = () => {
  useEffect(() => {
    var elem = document.getElementById('google_translate_element');
    console.log(elem.querySelector('span'));
    var poweredByDiv = document.getElementsByClassName('skiptranslate goog-te-gadget')
    poweredByDiv.innerText = '';
  }, []);
  
  return;
};

export default GoogleTranslate;
