define(function (require) {
    var activity = require("sugar-web/activity/activity");
    var datastore = require("sugar-web/datastore");

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();

        inputTextContent = document.getElementById("wmd-input-second");
        inputTextContent.value = "#This is a sample input";
        //to save and resume the contents from datastore.

        var datastoreObject = activity.getDatastoreObject();

        inputTextContent.onblur = function () {
            
            var jsonData = JSON.stringify((inputTextContent.value).toString());
            datastoreObject.setDataAsText(jsonData);
            datastoreObject.save(function () {});
        };
        markdownParsing(); //to load for the first time
        datastoreObject.loadAsText(function (error, metadata, data) {
            markdowntext = JSON.parse(data);
            inputTextContent.value = markdowntext;
            markdownParsing(); //to load again when there is a datastore entry
        });

        var journal = document.getElementById("insertText");

        journal.onclick = function () {
            activity.showObjectChooser(function (error, result) {
                //result1 = result.toString();
                var datastoreObject2 = new datastore.DatastoreObject(result);
                datastoreObject2.loadAsText(function (error, metadata, data) {
                    
                    try {
                        textdata = JSON.parse(data);
                    } catch (e) {
                        textdata = data;
                    }

                    var inputTextContent = document.getElementById("wmd-input-second");
                    //inputTextContent.value += textdata;
                    insertAtCursor(inputTextContent, textdata);
                });

            });
        };

        function insertAtCursor(myField, myValue) {
            //IE support
            if (document.selection) {
                myField.focus();
                sel = document.selection.createRange();
                sel.text = myValue;
            }
            //MOZILLA and others
            else if (myField.selectionStart || myField.selectionStart == '0') {
                var startPos = myField.selectionStart;
                var endPos = myField.selectionEnd;
                myField.value = myField.value.substring(0, startPos)
                    + myValue
                    + myField.value.substring(endPos, myField.value.length);
            } else {
                myField.value += myValue;
            }
            //markdownParsing();
        }

        function markdownParsing() {
            var converter2 = new Markdown.Converter();

            var help = function () {
                alert("Do you need help?");
            }
            var options = {
                helpButton: {
                    handler: help
                },
                strings: {
                    quoteexample: "whatever you're quoting, put it right here"
                }
            };

            var editor2 = new Markdown.Editor(converter2, "-second", options);

            editor2.run();
        }

    });

});