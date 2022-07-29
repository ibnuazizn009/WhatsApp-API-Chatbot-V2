const replymessage = require('../models/messagereply')
const { MessageMedia } = require('whatsapp-web.js');


const replymsg = async (keyword) =>{
    const message = await replymessage.find({'keyword':keyword})

    if(message.length > 0){
        if(!message[0].replyimage){
            return `${message[0].message}`
        }


        const contype = [];
        const data = [];
        const file = [];
        message.map(object => {
            contype.push(object.contentType)
            data.push(object.replyimage)
            file.push(object.filename) 
        })
        const value = []
        for (let key in message) {
            if (Object.hasOwnProperty.call(message, key)) {
                const mime = message[key].contentType;
                const data = message[key].replyimage;
                const file = message[key].filename;
                const media = new MessageMedia(mime, data, file);
                // return media.mimetype
                // return media
                value.push(media)
            }   
        }
        return {contype, data, file, value}

        
    }
}


module.exports = {replymsg}