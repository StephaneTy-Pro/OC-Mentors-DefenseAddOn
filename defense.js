// ==UserScript==
// @name         OC - Addons
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Add a menu bar to "Soutenance"
// @author       Stéphane TORCHY
// @updateURL    https://raw.githubusercontent.com/StephaneTy-Pro/OC-Mentors-DefenseAddOn/master/defense.js
// @downloadURL  https://raw.githubusercontent.com/StephaneTy-Pro/OC-Mentors-DefenseAddOn/master/defense.js
// @match        http*://*openclassrooms.com/*/users/*/projects/*

// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard

// @require 	 //https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.0/showdown.min.js
// @require 	 https://cdn.jsdelivr.net/npm/showdown@1.9.0/dist/showdown.min.js
// @require      https://draggabilly.desandro.com/draggabilly.pkgd.js

// STT scripts
// @require      https://raw.githubusercontent.com/StephaneTy-Pro/userscripts/master/docready.js
// @require      https://raw.githubusercontent.com/StephaneTy-Pro/userscripts/master/PureJSWaitUntil.js

// GM_Config
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js

// alertjs (version https://github.com/ankitpokhrel/alert.js) plus nécessaire

// jsPanel
// @require     https://raw.githubusercontent.com/StephaneTy-Pro/userscripts/master/lib/jsPanel/jspanel.min.js
// @resource    jspanelcss https://raw.githubusercontent.com/StephaneTy-Pro/userscripts/master/lib/jsPanel/jspanel.min.css

// simpleMDE fonctionne mais pas utilisé pour le moment
// https://simplemde.com/

// jsPanel CDN
// jsPanel extensions
// @require     https://cdn.jsdelivr.net/npm/jspanel4@4.5.0/dist/extensions/modal/jspanel.modal.js
// @require     //https://cdn.jsdelivr.net/npm/jspanel4@4.5.0/dist/extensions/tooltip/jspanel.tooltip.js
// @require     //https://cdn.jsdelivr.net/npm/jspanel4@4.5.0/dist/extensions/hint/jspanel.hint.js
// @require     //https://cdn.jsdelivr.net/npm/jspanel4@4.5.0/dist/extensions/layout/jspanel.layout.js
// @require     //https://cdn.jsdelivr.net/npm/jspanel4@4.5.0/dist/extensions/contextmenu/jspanel.contextmenu.js
// @require     //https://cdn.jsdelivr.net/npm/jspanel4@4.5.0/dist/extensions/dock/jspanel.dock.js
//jsPanelCDN


// liste blanches du domaine
// @connect     raw.githubusercontent.com
// @connect     raw.githubusercontent.com
// @connect     gist.githubusercontent.com
// @connect     cdnjs.cloudflare.com
// @connect     greasyfork.org

// ==/UserScript==

/* VERSIONS
  0.1 First release
  0.2 Ajout d'un script externe pour attendre la présence d'un élement
      Modification du code par openclassrooms qui désormais à mis le tout dans un iframe du nom de project_session_comment_ifr
  0.3 swal a un bug au dela de la cersion 7.33.1 en tout cas sous tampermonkey this.constructor.argsToParams  n'est pas connu et provoque une erreur, or je suis obligé de passer en version > 8 pour pouvoir saisir du contenu,
      de ce fait je remplace swal par un autre outil

*/

/* TODO
   ajouter la checkbox pour la vérification des cookies
*/

const windowcss = '#OCAddonsCfg {background-color: lightblue;} #OCAddonsCfg .reset_holder {float: left; position: relative; bottom: -1em;} #OCAddonsCfg .saveclose_buttons {margin: .7em;}';
const iframecss = 'height: 16.7em; width: 30em; border: 1px solid; border-radius: 3px; position: fixed; z-index: 999;';
const dbgcss    = 'position: absolute;top: 5px; left: 5px; right: 5px; bottom: 5px;padding: 10px;overflow-y: auto;display: none;background: rgba(250, 250, 250, 0.3);border: 3px solid #888;font: 14px Consolas,Monaco,Monospace;color: #ddd;z-index: 500';

const storageHistoryId = "OC_Addons_HISTORY";
const appName = "OC-Addons";
const author = "Stéphane TORCHY";


function opencfg()
{
	GM_config.open();
	OCAddonsCfg.style = iframecss;
}

GM_config.init(
{
    id: 'OCAddonsCfg',
    title: 'Configuration du module',
    fields:
    {
        defaultcomment:
        {
            section: ['Global', 'pamètres généraux'],
            label: 'commentaire par défaut',
            labelPos: 'left',
            'title': 'Merci de ne saisir que du markdown!', // Add a tooltip (hover over text)
            type: 'textarea',
            default: '**Avis global & verdict sur le travail de l\'étudiant:**\n \
\n> Le travail correspond aux attentes sur le projet à savoir\n \n> - [x] Lorem\n \
\n**Avis sur les livrables:**\n \n**Avis sur la présentation:**\n \n- Lorem\n \
\n**Avis sur la compréhension et la réalisation du projet:**\n  \n- Lorem\n \
\n**Points positifs:**\n \n- Lorem\n \
\n**Axes d\'amélioration:**\n \n- Lorem\n',
        },

        'hidecookies':{
            label: 'hidecookies',
            labelPos: 'left',
            type: 'checkbox',
            default: true,
        },


        'usesignature':
        {
            section: ['Signature', 'tweaks signature'],
            label: 'utiliser une signature',
            labelPos: 'left',
            type: 'checkbox',
            default: true,
        },
        signature: {
            label: 'signature',
            labelPos: 'left',
            type: 'input',
            default: 'Anonymous',
        },
        'usecacheprefix':
        {
            section: ['Cache', 'option pour la sauvegarde'],
            label: 'utiliser un prefixe pour stocker les soutenances dans la base de donnée',
            labelPos: 'left',
            type: 'checkbox',
            default: false,
        },
        'cacheprefix':
        {
            label: 'prefix',
            labelPos: 'left',
            type: 'input',
            'title': 'Saisir ici un prefixe complet (séparateur compris) qui viendra devant l\'id généré automatiquement pour l\'étudiant séléctionné', // Add a tooltip (hover over text)
            default: 'OCADDONS_',
        },
    },
    css: windowcss,
    events:
    {
        save: function() {
            GM_config.close();
        }
    },
});


(function() {
    'use strict';
    console.log('OC-Addons is loading....');
    /* le chargement de tinymce provoque un onload quand la frame se charge */
    if (inIframe()){
        console.log('je suis dans iframe');
        /* comme je suis dans l'iframe, les accès à la partie tinymce sont dans window.parent et non plus dans le contexte window par défaut*/
        waitUntil(function(){
            return typeof window.parent.tinymce === 'object' && typeof window.parent.tinymce.get === 'function';
        }, function(){
            var converter = new showdown.Converter()
            var md = GM_config.get('defaultcomment');
            if (GM_config.get('usesignature') === true){
                md+= "\n**"+GM_config.get('signature')+"** - _Mentor OpenClassrooms_";
            }
            var html = converter.makeHtml(md);
            window.parent.tinymce.get()[0].setContent(html);
        }, function(){
            console.error("OC-Addons:: Wait until n'a pas pu atteindre les conditions à attendre, ===== > I'm bored. I give up.");
            //console.log(typeof window.parent.tinymce === 'object' && typeof window.parent.tinymce.get === 'function');
        });
        return
    } else {
        window.docReady(setup);

        // chargement des CSS de jspnael
        GM_addStyle( GM_getResourceText("jspanelcss") );
    }



    function setup(){
        GM_registerMenuCommand('OC Addons - configure', opencfg);

     /*   GM_addStyle('\
.flex > * { margin: 0 10px; }    \
.flex > :first-child { margin-left: 0; }\
.flex > :last-child { margin-right: 0; }\
.panel {display: flex; justify-content: center;z-index:999}\
.menuBar {border-top: 1px solid; padding: 10px; font-size: 1rem; pointer-events: inherit;position: relative;top:0px;}\
.draggable {background: transparent;border-radius: 10px;padding: 20px;}\
.draggable.is-pointer-down {background: #09F;}\
.draggable.is-dragging { opacity: 0.7; }\
.handle {background: #555;background: hsla(0, 0%, 0%, 0.4);width: 20px;height: 20px; border-radius: 10px;}\
');*/

        GM_addStyle(".flex > * { margin: 0 10px; }.flex > :first-child { margin-left: 0; }.flex > :last-child { margin-right: 0; }.panel {display: flex; justify-content: center;z-index:999}.menuBar {border-top: 1px solid; padding: 10px; font-size: 1rem; pointer-events: inherit;position: relative;top:0px;}.draggable {background: transparent;border-radius: 10px;padding: 20px;}.draggable.is-pointer-down {background: #09F;}.draggable.is-dragging { opacity: 0.7; }.handle {background: #555;background: hsla(0, 0%, 0%, 0.4);width: 20px;height: 20px; border-radius: 10px;}");

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
        //addButton('HideCookies', hideCookies, {},div);

        var draggie = new Draggabilly('.draggable', {handle: '.handle'});
        // hiding cookies
         if (GM_config.get('hidecookies') === true){
             hideCookies();
         }
        // if needed build a html debug console
        // SRC: https://gist.github.com/jmhdez/6405474 && https://gist.github.com/Aben/2261937
        // buildJSConsole();
    }

    function buildJSConsole(){
        // Create the DOM structure to hold the console messages

        var div = document.createElement("div");
        div.id = "debugconsole";
        div.style.cssText = dbgcss;

        var ul = document.createElement("ul");
        ul.style.cssText = "padding: 0; list-style-type: none; margin: 0";
        div.appendChild(ul)

        document.body.appendChild(div);
    }
    /*
     * Exemple :
     *     addMsgToConsole("DEBUG");
     */
    function addMsgToConsole(msg) {
        var console = document.getElementById('debugconsole');
        //console.style.display = console.style.display === "none" ? "block" : "none";
        // affiche la console au premier message
        console.style.display = "block";
        var date = new Date()
            ,now = [ date.toLocaleTimeString(), '.', date.getMilliseconds(), ' -> ' ].join('');
        var li = document.createElement("li");
        li.innerText = [date,'-', msg].join('');
        var ul = console.firstChild;
        ul.appendChild(li);
    }

    function hideIt(el){
        if (el && typeof el == 'object'){
            el.style.display = "none";
            console.log("oc-disclaimerMessage__container is hidden");
        }
    }
    function hideCookies(){
        waitUntil(function(){
            var el = document.getElementsByClassName('oc-disclaimerMessage__container');
            return el && typeof el[0] == 'object'}
        , function(){
           var el = document.getElementsByClassName('oc-disclaimerMessage__container');
            el[0].style.display = "none";
        }, function(){console.error('OC-Addons:: les cookies ne peuvent pas être cachés, attente trop longue')});

    }
    function convertToMd(){
        console.log(typeof tinyMCE);
        //debugger;
        var tinymce = tinyMCE || window.parent.tinymce
        if (tinymce){
            var el = tinymce.get()[0].getContent();
            var converter = new showdown.Converter();
            var md = converter.makeMarkdown(el);
            //console.log(md);
            GM_setClipboard(md, 'md');
        } else {throw Error('convertToMd: Tiny MCE not loaded');}
    }
    function convertFrmMd(){
        // parfois tinymce, parfois tinyMCE les deux existent cepandant mais probablement pas tout à fait dans le meme contexte
        var ref = tinyMCE;

        jsPanel.create({
    content:     '<div class="editor flex">' +
                 '<div class="container">' +
                 '<textarea id="editormd" cols="80" rows="40" style="">### Hello Editor.md !</textarea>' +
                 '</div>' +
                 '<button data-action="success" class="button button--primary">Valider</button>' +
                 '<button data-action="cancel" class="button button--primary">Annuler</button>' +
                 '</div>',
    contentSize: '750 auto',
    headerTitle: appName + ' - Markdown Editor',
    theme:       '#2196F3',
    callback: function (panel) {

        this.content.style.padding = '20px';
        // handle click
        var pPanel = this;
        //console.log(pPanel)
        this.querySelectorAll("button").forEach( function(ob){
            ob.addEventListener("click", function(event) {
                if (event.srcElement.getAttribute('data-action')!== undefined){
                    switch (event.srcElement.getAttribute('data-action')) {
                        case "success":
                            var md = pPanel.querySelector('#editormd').value;
                            console.log(md);
                            var converter = new showdown.Converter();
                            var html = converter.makeHtml(md);
                            console.log(html);
                            if(ref){
                                ref.get()[0].setContent(html);
                            } else {throw Error('convertFrmMd:Tiny MCE not loaded');}
                            pPanel.close();
                            event.preventDefault();
                            break;
                        case "cancel":
                            pPanel.close();
                            event.preventDefault();
                            break;
                        default:
                            console.error(`${event.srcElement.getAttribute('data-action')} évenement non géré`);
                            break;
                    }
                }
            });
        });
    }
});

    }
    function save(){
        var ref = tinyMCE;
        if (ref){
            var el = ref.get()[0].getContent();
            var id = new URL(window.location);
            var hash = hashFnv32a(id.toString(),true);
            if (GM_config.get('usecacheprefix')==true){
                hash = [GM_config.get('cacheprefix'),hash].join('');
            }
            localStorage.setItem(hash, el);
            var aHist = JSON.parse(localStorage.getItem(storageHistoryId)) || [];
            aHist.push(hash);
            localStorage.setItem(storageHistoryId ,JSON.stringify(aHist));
        }else {throw Error('save():Tiny MCE not loaded');}
    }
    function load(){
        var ref = tinyMCE;
        var id = new URL(window.location);
        var hash = hashFnv32a(id.toString(),true);
        if (GM_config.get('usecacheprefix')==true){
            hash = [GM_config.get('cacheprefix'),hash].join('');
        }
        var data = localStorage.getItem(hash);
        if (ref){
            // If there are any saved items, update our list
            if (data) {
                ref.get()[0].setContent(data);
            }
        }else {throw Error('load():Tiny MCE not loaded');}
    }
    function resetLocalStorage(){
        jsPanel.modal.create({
            headerTitle: appName + ' - RAZ',
            contentSize: '500 auto',
            content: '<form class="flex">'+
            '<div class="form-group">' +
            '<h1 class="projectSessionForm__title">Etes vous sûr</h1>' +
            '<span> cela va supprimer tous les commentaires de soutenance précédents </span>' +
            '<br>&nbsp;<br>' +
            '</div>' +
            '<button type="submit" class="button button--primary">Oui supprimez le!</button>' +
            '<button data-action="cancel" class="button button--primary">Heu non !!!! </button>' +
            '</form>',
            callback: function () {
                this.content.style.padding = '20px';
                // handle click
                var pPanel = this;
                //console.log(pPanel)
                this.querySelectorAll("button").forEach( function(ob){
                    ob.addEventListener("click", function(event) {
                        if (event.srcElement.getAttribute('type') === 'submit'){
                            console.log('submit interception');
                            //event.stopPropagation();
                            event.preventDefault(); // evite le message d'erreur Form submission canceled because the form is not connected
                            var aHist = JSON.parse(localStorage.getItem(storageHistoryId)) || [];
                            try {
                                aHist.map( e => localStorage.removeItem(e) );
                                aHist = [];
                                localStorage.setItem(storageHistoryId ,JSON.stringify(aHist));
                            } catch (e){ console.error("Error [${e}] raised when removing items on local storage");}
                            pPanel.close();
                        }
                        if (event.srcElement.getAttribute('data-action')!== undefined){
                            switch (event.srcElement.getAttribute('data-action')) {
                                case "cancel":
                                    pPanel.close();
                                    event.preventDefault();
                                    break;
                                default:
                                    console.error(`${event.srcElement.getAttribute('data-action')} évenement non géré`);
                                    break;
                            }
                        }
                    });
                });
            }
        });

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


// SOME EXTERNAL SCRIPTS
// TODO put them in global script


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

function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

// found in stackoverflow to add an element first waiting full implementation of appendFirst in DOM
HTMLElement.prototype.appendFirst=function(childNode){
    if(this.firstChild)this.insertBefore(childNode,this.firstChild);
    else this.appendChild(childNode);
};
