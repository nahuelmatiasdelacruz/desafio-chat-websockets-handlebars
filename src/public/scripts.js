const socketClient = io();

//Enviar producto a traves de sockets
const productForm = document.getElementById("productForm");
productForm.addEventListener("submit", (e) =>{
    e.preventDefault();
    const product = {
        title: document.getElementById("title").value,
        price: document.getElementById("price").value,
        thumbnail: document.getElementById("thumbnail").value
    }
    // Enviar el producto por medio de sockets

    socketClient.emit("newProduct",product);
});

// Enviar mensaje
const messageForm = document.getElementById("messageForm");
messageForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    const nowdate = getDate();
    const message = {
        email: document.getElementById("email").value,
        date: nowdate,
        message: document.getElementById("message").value
    }
    socketClient.emit("newMessage",message);
    document.getElementById("message").value = "";
});

const getDate = () => {
    const date = new Date();
    const month = date.getMonth()+1;
    const dateFormated = date.getDate() + "/" + month + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return dateFormated;
}

socketClient.on("messages",async(data)=>{
    const templateMessage = await fetch("./templates/chat.handlebars");
    const templateFormat = await templateMessage.text();
    const template = Handlebars.compile(templateFormat);
    // Se genera el HTML con el template y con los datos de los productos
    const html = template({
        messages: data
    });
    messagesContainer.innerHTML = html;
});

const productsContainer = document.getElementById("productsContainer");

socketClient.on("products",async(data)=>{
    const templateTable = await fetch("./templates/table.handlebars");
    const templateFormat = await templateTable.text();
    const template = Handlebars.compile(templateFormat);
    // Se genera el HTML con el template y con los datos de los productos
    const html = template({
        products: data
    });
    productsContainer.innerHTML = html;
})