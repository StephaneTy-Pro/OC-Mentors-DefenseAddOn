// ==UserScript==
// @name         OC - Addons
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add a menu bar to "Soutenance"
// @author       You
// @match        http*://*openclassrooms.com/*/users/*/projects/*
// @require 	 https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.0/showdown.min.js
// @require      https://draggabilly.desandro.com/draggabilly.pkgd.js
// @require      https://raw.githubusercontent.com/fabien-d/alertify.js/0.3/lib/alertify.min.js
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@7.32.2/dist/sweetalert2.all.min.js
// @resource     alertify_core https://raw.githubusercontent.com/fabien-d/alertify.js/0.3/themes/alertify.core.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==



(function() {
    'use strict';

  window.addEventListener('load', function (ev){

    if (ev.srcElement.activeElement.className.includes("mce-content-body")) {
        // iframe had onload event and this create 2*MenuBar
        return;
    }

      headAddStyle("alertify_core");
      console.dir(alertify);
      alertify.alert("This is an alert dialog"); // semble ne pas fonctionner

   GM_addStyle('\
        .flex > * { margin: 0 10px; }    \
        .flex > :first-child { margin-left: 0; }\
        .flex > :last-child { margin-right: 0; }\
        .panel {display: flex; justify-content: center;z-index:999}\
        .menuBar {border-top: 1px solid; padding: 10px; font-size: 1rem; pointer-events: inherit;position: relative;top:0px;}\
        .draggable {background: transparent;border-radius: 10px;padding: 20px;}\
        .draggable.is-pointer-down {background: #09F;}\
        .draggable.is-dragging { opacity: 0.7; }\
        .handle {background: #555;background: hsla(0, 0%, 0%, 0.4);width: 20px;height: 20px; border-radius: 10px;}\
         ');

    var el = document.getElementsByClassName('oc-disclaimerMessage__container');
    if (el && typeof el[0] == 'object'){
        hideIt(el[0]);
    }else{
        setTimeout(hideIt(el[0]), 9000);
    }
    /*var top = '61%';
    addButton('Txt > Mark', convertToMd, {position: 'absolute', top: top, left:'45%', 'z-index': 3});
    addButton('Txt < Mark', convertFrmMd, {position: 'absolute', top: top, left:'55%', 'z-index': 3});
    addButton('HideCookies', hideCookies, {position: 'absolute', top: top, left:'65%', 'z-index': 3});
    addButton('Load', load, {position: 'absolute', top: top, left: '25%', 'z-index': 3});
    addButton('Save', save, {position: 'absolute', top: top, left:'32%', 'z-index': 3});*/

    // create menu bar
    var div = document.createElement('div');
    var subDiv = document.createElement('div');
    subDiv.classList.add('handle');
    div.appendChild(subDiv);
    div.classList.add('panel', 'menuBar', 'flex', 'draggable');
    document.body.appendFirst(div);
    addButton('Load', load, {},div);
    addButton('Save', save, {},div);
    addButton('RAZ', resetLocalStorage, {}, div);
    addButton('Txt > Mark', convertToMd,{},div );
    addButton('Txt < Mark', convertFrmMd, {},div);
    addButton('HideCookies', hideCookies, {},div);

    var draggie = new Draggabilly('.draggable', {handle: '.handle'});
  })

  function hideIt(el){
    if (el && typeof el == 'object'){
      el.style.display = "none";
      console.log("oc-disclaimerMessage__container is hidden");
    }
  }
  function hideCookies(){
    var el = document.getElementsByClassName('oc-disclaimerMessage__container');
    if (el && typeof el[0] == 'object'){
      el[0].style.display = "none";
      console.log("oc-disclaimerMessage__container is hidden");
    }
  }
  function convertToMd(){
     if (tinymce){
     var el = tinymce.get()[0].getContent();
     var converter = new showdown.Converter();
     var md = converter.makeMarkdown(el);
     console.log(md);
     } else {throw Error('Tiny MCE not loaded');}
  }
  function convertFrmMd(){
      if (tinymce){
        var el = tinymce.get()[0].getContent();
        var converter = new showdown.Converter();
        var html = converter.makeHtml(el);
        console.log(html);
      }{throw Error('Tiny MCE not loaded');}
  }

  function save(){
      if (tinymce){
        var el = tinymce.get()[0].getContent();
        var id = new URL(window.location);
        var hash = hashFnv32a(id.toString(),true);
        localStorage.setItem(hash, el);
      }{throw Error('Tiny MCE not loaded');}
  }
  function load(){
      var id = new URL(window.location);
      var hash = hashFnv32a(id.toString(),true);
      var data = localStorage.getItem(hash);
      if (tinymce){
        // If there are any saved items, update our list
        if (data) {
          tinymce.get()[0].setContent(data);
        }
      }{throw Error('Tiny MCE not loaded');}
  }
  function resetLocalStorage(){
      // voir aussi localStorage.removeItem(key);
      //localStorage.clear();
Swal({
  title: 'Etes vous sûr?',
  text: "Vous ne pourrez par revenir en arrière !",
  type: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Oui supprimez le!'
}).then((result) => {
  if (result.value) {
      localStorage.clear();
    Swal(
      'Deleted!',
      'Votre localstorage a été effacé.',
      'success'
    )
  }
})
  }
  // https://stackoverflow.com/questions/6480082/add-a-javascript-button-using-greasemonkey-or-tampermonkey
  // modified by stt
  function addButton(text, onclick, cssObj,el) {
    el = el || document.body;
    cssObj = cssObj || {position: 'absolute', bottom: '7%', left:'4%', 'z-index': 3}
    let button = document.createElement('button'), btnStyle = button.style
    button.classList.add('button--primary', 'button');
    el.appendChild(button)
    button.innerHTML = text
    button.onclick = onclick
    //btnStyle.position = 'absolute'
    Object.keys(cssObj).forEach(key => btnStyle[key] = cssObj[key]);
    return button
   }
})();

/**
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {string} str the input value
 * @param {boolean} [asString=false] set to true to return the hash value as
 *     8-digit hex string instead of an integer
 * @param {integer} [seed] optionally pass the hash of the previous chunk
 * @returns {integer | string}
 */
function hashFnv32a(str, asString, seed) {
    /*jshint bitwise:false */
    var i, l,
        hval = (seed === undefined) ? 0x811c9dc5 : seed;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    if( asString ){
        // Convert to 8 digit hex string
        return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
    }
    return hval >>> 0;
}

function headAddStyle(res){
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet){
        // This is required for IE8 and below.
        style.styleSheet.cssText = GM_getResourceText(res);
    } else {
        style.appendChild(document.createTextNode(GM_getResourceText(res)));
    }
}


// found in stackoverflow to add an element first waiting full implementation of appendFirst in DOM
HTMLElement.prototype.appendFirst=function(childNode){
    if(this.firstChild)this.insertBefore(childNode,this.firstChild);
    else this.appendChild(childNode);
};
