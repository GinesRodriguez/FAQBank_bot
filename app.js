"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const builder = require("botbuilder");

var azure = require('botbuilder-azure');
var documentDbOptions = {
    host: 'https://faqbank.documents.azure.com:443/', 
    masterKey: 'q2k5tb7GwD9LyhH8XEta5g8PRP8i26OPUURnb6xSfPAdzooMKkUv1cAEwmcrTlnF5Umw0neOakh2Ro540AilGA==', 
    database: 'faqbank',   
    collection: 'faqbank'
};

//const mysql = require('mysql');
var cognitiveservices = require('botbuilder-cognitiveservices');
//const handoff_1 = require("./handoff");
//const commands_1 = require("./commands");
//var config = require('./config.js');

//Variables globales prueba
var i;
var j = 0;
var botcard = 'tarjeta';

//=========================================================
// Bot Setup
//=========================================================
const app = express();
// Setup Express Server
app.listen(process.env.port || process.env.PORT || 3978, '::', () => {
    console.log('Server Up');
});
// Create chat bot
const connector = new builder.ChatConnector
({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);
app.post('/api/messages', connector.listen());

// Create endpoint for agent / call center
app.use('/webchat', express.static('public'));

// replace this function with custom login/verification for agents
//const isAgent = (session) => session.message.user.name.startsWith("Agent");
//const handoff = new handoff_1.Handoff(bot, isAgent);

//=========================================================
// Acciones Globales
//=========================================================
/*
bot.beginDialogAction('Resetear Password','/resetear_password', { matches: /^Resetear Password/i });
bot.beginDialogAction('Localizar Tienda','/localizar_tienda', { matches: /^Localizar Tienda/i });
bot.beginDialogAction('Disponibilidad Art','/disponibilidad_articulo', { matches: /^Disponibilidad Art/i });
bot.beginDialogAction('Consulta Disponibilidad','/consulta_disponibilidad');
*/
//========================================================
// Bot Middleware
//========================================================
//bot.use(commands_1.commandsMiddleware(handoff), handoff.routingMiddleware());

//=========================================================
// Bots Dialogs
//=========================================================
var recognizer = new cognitiveservices.QnAMakerRecognizer(
{
    //FAQBank
    knowledgeBaseId: '0f2bda23-4a29-4f1c-9893-428cf86b0535',
    subscriptionKey: 'cf47f68088e74e0e98a77cabb1f90ec4'
});

var basicQnAMakerDialog = new cognitiveservices.QnAMakerDialog(
{
    recognizers: [recognizer],
    defaultMessage: 'I\'m sorry. I can\'t understand you. Please, make me a question about FAQBank Online Services.',
    qnaThreshold: 0.6
});


basicQnAMakerDialog.invokeAnswer = function (session, recognizeResult, threshold, noMatchMessage)
{
    var qnaMakerResult = recognizeResult;
			
    if (qnaMakerResult.score >= threshold)
    {
        session.send(qnaMakerResult.answers[0].answer);
    }

	else if ((qnaMakerResult.score < threshold) && j < 2)
    {
		if (qnaMakerResult.score > 0.20)
		{
			session.send("Is this answer useful for your question?");
			session.send(qnaMakerResult.answers[0].answer);
			session.send("If not, please, try it again.");
			j=j+1;
		}
		else
		{
			session.send('I\'m sorry. I can\'t understand you.' +
                        '\n\nPlease, make me a question about FAQBank Online Services.'
                        );
j=j+1;
		}
	}

    else
    {
        session.send('Siento no poder ayudarte. Escribe **ayuda**, para ser atendido por un *Agente*');
        j=0;
    }
};

bot.dialog('/',
[
    function(session)
    {
        i=0;
        session.beginDialog('/presentacion');
    }
]);

bot.dialog('/presentacion',
[
    function(session)
    {
        if(i<1)
        {
            session.send('Welcome to FAQBank chat.' +
                        '\n\nHello. I am FAQBank bot.' +
                        '\n\nI am ready to answer Frequently Answered Questions about FAQBank Online Service.' +
                        '\n\nWhat do you want to know?');

                        session.userData.contadord = 0;
            i=i+1;
        }
        else
        {
            session.beginDialog('/preguntas');
        }
    }
]);

bot.dialog('/preguntas', basicQnAMakerDialog);

