// Load the API that allows us to create Extensions
var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");

var sendingMethod = {
    deliverNow: 0,          //basically send now
    queueForLater: 1,       //queue for sending, but only send when the user says so
    save: 2,                //save in the obvious fashion
    //not exposing 'saveAs: 3' because it mainly allow syou to saveAsDraft or saveAsTemplate.  There is an option to save as a file, but I don't think we should expose that to the user, plus I'm not sure how to actually choose that option via programming
    saveAsDraft: 4,         //save it as a draft
    saveAsTemplate: 5,      //save it as a template
    //not exposing 'sendUnsent: 6', because I've never seen this used in Thunderbird... I have seen it used in Outlook though... so maybe we should expose this?  If so, do I need to change the body of the email?
    //the sendingMethod for '7' does not exist for some wierd reason... hmmm....
    deliverBackground: 8    //sends in the background, works pretty normally (honestly, it might be good to set this as the default because most messages should be sent this way)
}

// Establish the namespace we are going to use
var composeExperiment = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      // The base object for that namespace which has our functions
      composeExperiment: {

        //Pass our sendingMethod variable to the user
        sendingMethod: sendingMethod,

        // A function which allows us to write an email message and save it to the drafts folder
        sendNew: function(messageId, details, sendingMethod)
        //writeDraft: function(subject, body, to, from, cc, bcc, replyto)
        {
            //TDOO:  pass the data to the onBeforeSend event handler immediately if necessary (without attachment information and a tab id)
            //TODO:  maybe pass the data to the onAttachmentAdded event handler immediately if necessary

            var { MailServices } = ChromeUtils.import("resource:///modules/MailServices.jsm");

            /*
                TODO:  allow the user to change the default account and identity (account currently is not passed to details, see if TB can add it as a paramater)
            */
            var account = MailServices.accounts.defaultAccount;
            var identity = account.defaultIdentity;

            //TODO:  change these to alow work with the possibility of the contacts and mailing list APIs (see compposeRecipient type)
            //TODO:  figure out what in the world 'followupTo is for' as well (never heard of it before)
            let composeFields = Components.classes["@mozilla.org/messengercompose/composefields;1"].createInstance(Components.interfaces.nsIMsgCompFields);
            composeFields.to = (details.to.join(",") || "");
            composeFields.cc = (details.cc.join(",") || "");
            composeFields.bcc = (details.bcc.join(",") || "");
            composeFields.replyTo = (details.replyTo.join(",") || "");

            //TODO get the person who this is from based off of the account, and identity
            //TODO also possibly let the user change this via the details information
            composeFields.from = (from || "");

            //set the subject of the email we are sending
            composeFields.subject = (details.subject || "");

            /*
                TODO:
                Set the appropriate body in the following steps
                (1) if messageId was provided, load the appropriate message or template
                (2) if isPlainText was provided, only provide a plain text body
                (3) attach the appropriate body (htmlbody) if it exists provided (2) isn't set
                (4) attach thea appropriate plainTextBody if it exists
                (5) attach any attachments
                (6) see how to deal with signatures consistently
            */
            composeFields.body = ("") + "\r\n";

            //Create some instances of internal Thunderbird classes we will need
            let composeParams = Components.classes["@mozilla.org/messengercompose/composeparams;1"].createInstance(Components.interfaces.nsIMsgComposeParams);
            let composer = Components.classes["@mozilla.org/messengercompose/compose;1"].createInstance(Components.interfaces.nsIMsgCompose);
            let sendType = Components.classes["@mozilla.org/messengercompose/send;1"].createInstance(Components.interfaces.nsIMsgSend);
            
            //stick the compose params into the appropriate object, and then initialize that object
            composeParams.composeFields = composeFields;
            composer.initialize(composeParams);

            //sen the message
            composer.SendMsg(sendingMethod, identity, account.key, null, null);

            //TODO:  Use the appropriate send type specified in the context
        }
      },

      //TODO:  will finish these functions later
      sendReply: function(messageId, details, context)
      {

      },

      sendForward: function(messageId, details, context)
      {

      },

    };
  }
};