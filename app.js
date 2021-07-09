//jshint esversion:6
// mongo "mongodb+srv://cluster0.xswtu.mongodb.net/myFirstDatabase" --username admin-anurag
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");  //ejs setup
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//----MongoDB---
mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = new mongoose.Schema({
   name: {
     type: String,
     required: [true, "No task is done task"]
   }
});

const Item = mongoose.model("Item", itemsSchema);

const i1 = new Item({
   name: "Add Your Tasks here"
})

const defaultItems = [i1];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

app.get("/",function(req,res){

  Item.find({}, function(err, foundItems){
     if(foundItems.length === 0)
     {
           Item.insertMany(defaultItems, function(err){
              if(err){
                console.log(err);
              }
              else{
                console.log("Default items added!");
              }
           });
           res.redirect("/");
     }
     else{
          res.render("list", {listTitle: "Today", newListItems: foundItems});
     }
  });

});


app.post("/",function(req,res){

   const itemName = req.body.newItem;
   const listName = req.body.list;

   const item = new Item({
     name: itemName
   })

   if(listName === "Today"){
        item.save();
        res.redirect("/");
   }
   else{
       List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
       });
   }

});

app.post("/delete",function(req, res){

   const checkedItemId = req.body.checkBox;
   const listName = req.body.listName;

   if(listName === "Today"){
       Item.deleteOne({_id: checkedItemId}, function(err){
         if(err){
           console.log(err);
         }
         else{
           console.log("Deleted Successfully!");
         }
           res.redirect("/");
       });
   }
   else{
       List.findOne({name: listName}, function(err, foundList){
            if(!err){
               let arr = foundList.items;
               for(var i=0; typeof arr!=='undefined' && i<arr.length; i++)
               {
                   if(arr[i]._id == checkedItemId)
                   {
                          arr.splice(i,1);
                          foundList.items = arr;
                          foundList.save();
                          break;
                   }
               }
               res.redirect("/" + listName);
            }
      });
        // List.findOneAndUpdate({name: listName}, {$pull : {items: {_id: checkedItemId} }}, function(err ,foundList){
        //     if(!err)
        //     {
        //         res.redirect("/" + listName);
        //     }
        // });
   }
})

// For custom lists
app.get("/:customListname",function(req,res){

    const customListname = _.capitalize(req.params.customListname);

    List.findOne({name: customListname}, function(err, foundList){
        if(!err){
            if(!foundList){
              // create a new List
              const list = new List({
                name: customListname,
                items: defaultItems
              });
              list.save();

              res.redirect("/" + customListname);
            }
            else{
              // show existing list
               res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });

});


app.get("/about",function(req,res){
  res.render("about");
});

// app.post("/work",function(req,res){        // doesnt work ...item goes back to "/"
//   workItems.push(req.body.newItem);
//   res.redirect("/work");
// });

app.listen(3000,function(){
  console.log("Server on port 3000");
});
