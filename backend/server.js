const express = require("express");
const app = express();
const port = 8080;
const db = require("./db")
const booking = require("./booking");
const addProducts = require("./addProductSchema");
const cors = require("cors");
app.use(cors());
app.use(express.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.static(path.join(__dirname, "../adminPanel")))
const nodemailer = require("nodemailer");
const fileUpload = require("express-fileupload");
// fileUpload({
//     useTempFiles: true
// })
app.use(fileUpload({
    useTempFiles: true
}));
app.use(express.urlencoded({ extended: true }));
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: 'drfdoy1od',
    api_key: '773861696165423',
    api_secret: 'wzsOT_E4C6oWKIEncQsu0w1f4x8'
});

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "sonurajsonuraj4515@gmail.com",
        pass: "iznitdhhvsbwrmty"
    }
})


app.get("/", (req, res) => {
    // res.send("server is live ")
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
})
// admin Login
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "../adminPanel/order/addProduct.html"))
})
app.post("/newClient", async (req, res) => {
    try {
        const data = req.body;
        const viewData = new booking(data);
        const response = await viewData.save();
        console.log("✅date saved succefully✅");
        res.status(200).json(response);
        //email send 
        // await
        transporter.sendMail({
            from: "sonurajsonuraj4515@gmail.com",
            to: "sonurajsonuraj4515@gmail.com",
            subject: "New Appoinment Booking",
            html: `
                <h2>New Booking</h2>
                <p><b>Name: </b>${data.FullName}</p>
                <p><b>Phone: </b>${data.mobileNumber}</p>
                <p><b>Email: </b>${data.email}</p>
            
            `
        })
            .then((info) => {
                console.log("Email sent ssuccesfuly")

            })
            .catch((err) => {
                console.log(err);

            })

    }
    // console.log("Email sent ssuccesfuly");

    // res.status(200).json(response);

    catch (error) {
        res.status(500).json("interal server error")
        console.log(error);

    }
})

app.post("/addProduct", async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.files);
        console.log(req.headers);
        if (!req.files || !req.files.photo) {
            return res.status(400).send("On Fill Uploade")
        }

        const fille = req.files.photo;

        const jpgReiult = await cloudinary.uploader.upload(
            fille.tempFilePath
        );
        console.log(jpgReiult);
        const addProductdata = req.body;
        console.log(req.body);
        addProductdata.photo = jpgReiult.secure_url;



        const viewaddPoduct = new addProducts(addProductdata);
        // console.log(viewaddPoduct);

        const responseaddProduct = await viewaddPoduct.save()
        console.log("✅date saved succefully✅");
        res.status(200).json(responseaddProduct);
    }
    catch (err) {
        res.status(500).json({ message: "Dublicate SubCategory not allowed" })
        console.log(err);

    }


})

//view all product

app.get("/addProduct", async (req, res) => {
    const viewProduct = await addProducts.find();
    res.json(viewProduct);
})
//delete Product

app.delete("/DelProduct/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await addProducts.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Product not Found" })
        }
        res.status(200).json({ message: "Data Delete SuccessFully" })

    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.put("/updateProduct/:id", async (req, res) => {
    try {
        const updateDataID = req.params.id;
        const { Productname, Category, SubCategory, Units, Rate, description } = req.body;
        const updateProductName = await addProducts.findByIdAndUpdate(updateDataID,
            {
                description,
                Productname,
                Category,
                // SubCategory,
                Units,
                Rate
            },
            { new: true })
        if (!updateProductName) {
            return res.status(404).json({
                message: "Product Not Found"
            })
        }
        res.status(200).json({
            message: "Product Updated Successfully",
            data: updateProductName
        })
    }
    catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                message: "Duplicate Category And subCategory not allowed"
            })
        }
        res.status(500).json({
            error: err.message
        })
    }
})





app.listen(port, () => {
    console.log(`server is live on ${port}`);

})