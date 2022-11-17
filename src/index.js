// Constantes
const fs = require("fs");
const express = require("express");
const {Server} = require("socket.io");
const app = express();
const handlebars = require("express-handlebars");
const path = require("path");
const viewsFolder = path.join(__dirname, "views");
const PORT = 8081;
const server = app.listen(PORT,()=>{
    console.log("Server on");
});
const io = new Server(server);

// Sets
app.set("views",viewsFolder);
app.set("view engine","handlebars");
app.engine("handlebars",handlebars.engine());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(__dirname+"/public"));

// Peticiones
app.get("/",(req,res)=>{
    res.render("home");
});
app.post("/productos",async (req,res)=>{
    const result = await addProduct(req.body);
    res.redirect("/")
});

//WebSocket
io.on("connection",async (socket)=>{
    // Enviamos mensajes y productos al cliente
    const messages = await getMessages();
    socket.emit("messages",messages)
    const products = await getProducts();
    socket.emit("products",products);  
    
    socket.on("newMessage",async (data)=>{
        const newMessages = await addMessage(data);
        socket.emit("messages",newMessages);
    });
    socket.on("newProduct",async (data)=>{
        await addProduct(data);
        const products = await getProducts();
        socket.emit("products",products);
    });
})

// Funciones
const getMessages = async () => {
    try{
        const content = await fs.promises.readFile("./messages.txt","utf-8");
        return JSON.parse(content);
    }catch(e){
        return [];
    }
}

const addMessage = async (data)=> {
    const actualMessages = await getMessages();
    const newMessage = {
        email: data.email,
        date: data.date,
        message: data.message
    }
    actualMessages.push(newMessage);
    try{
        await fs.promises.writeFile("./messages.txt",JSON.stringify(actualMessages));
        const messages = await getMessages();
        return messages;
    }catch(e){
        console.log("Error escribiendo el archivo" + e);
        return null;
    }
}

const getProducts = async () => {
    try{
        const content = await fs.promises.readFile("./products.txt","utf-8");
        return JSON.parse(content);
    }catch(e){
        return [];
    }
}

const addProduct = async (data) =>{
    const actualProducts = await getProducts();
    const newId = parseInt(actualProducts[actualProducts.length-1].id) + 1;
    const newProduct = {
        id: newId,
        title: data.title,
        price: data.price,
        thumbnail: data.thumbnail
    }
    actualProducts.push(newProduct);
    try{
        await fs.promises.writeFile("./products.txt",JSON.stringify(actualProducts));
    }catch(e){
        console.log("Error escribiendo el archivo" + e);
    }
}