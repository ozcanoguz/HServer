var Express = require('express');
var router = Express.Router();
var multer = require('multer');
var bodyParser = require('body-parser');
var FCM = require('fcm-node');
var app = Express();
var file_name;
var port = 2100;
var hostName = "52.59.194.10";

app.use(bodyParser.json());
var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./Files");
    },
    filename: function (req, file, callback) {
        file_name = file.originalname + "_" + Date.now();
        callback(null, file_name);
    }
});

var upload = multer({ storage: Storage }).array("imgUploader", 3); //Field name and max count 

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get('/api/download', function (req, res, next) {
    console.log("Download service is started for file : " + req.query.fileName);
    var filePath = "./Files/" + req.query.fileName; // Or format the path using the `id` rest param
    parts = req.query.fileName.split('_');
    timestamp = parts.pop();
    actual_filename = parts.join('_');
    console.log("File will be downloaded as : " + actual_filename);
    res.download(filePath, actual_filename);
});

app.post("/api/upload", function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            //notifyFileName(file_name);
            return res.end("Something went wrong!");
        }
        console.log("File name : " + file_name);
        notifyFileName(file_name, 'csFA2mEHpcM:APA91bEuhcCjUAcZN4dTfT3awCHgAmHqLjelBVP45o5gs0Uvpu03niT2Y2deM9yD0x1eYsR_w99xfTSjSYAthAaHAdNhgNuR6h-iJuPt4M-ju4BxTWSrSpSaFeoWmFjPEF-cbKPW1GDm');
        return res.end("File with name : " + file_name + " uploaded sucessfully!");
    });
});

//var serverKey = 'AAAA5D0LEgA:APA91bG9LWTbwHb5JAdJsCAp-Ztbbf6B-TMW15w9fUrk3sgYbT_IzTPcaqkfT7IHy72_N1xjxb4z9IZ6jhWbwN6ZxF1EawP_iBaJU02DvyPH7GufCRcMHedQ5jRWdH01TbCLuqnXnGpc'; //put your server key here
var serverKey_decoder = 'AAAA9HJp4Wo:APA91bF0EVMrUcf5dn2B_J4Iz0u5-46A-84sprd6vpywmGZGa0yqYgUoRUPq_MRk5BHvRyBaLJC7iAkP40xMTnobVj-23WtoGmGGuCyhuQQrVJTjioWN1Lu69EKGwqW8fvLfyj9EN_uN'; //put your server key here
var fcm = new FCM(serverKey_decoder);

function notifyFileName(name,token_key){
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: "/topics/upload",
        data: {
            content: "http://" + hostName + ":" + port + "/download?fileName=" + name,
            fileName: name,
            priority : "high",
            content_available : "true"
        }
    };
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong with FCM service!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

app.listen(port, function (a) {
    console.log("Listening to port : " + port);
});