//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash")


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ParthKaji:Cloud%403030@cluster0.vrg0e.mongodb.net/todolistDB",{useNewUrlParser:true});
const itemsSchema=mongoose.Schema({
  name:String
})
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to todo list"
})
const item2=new Item({
  name:"Hit + to add new item"
})
const item3=new Item({
  name:"Hit <-- to delete item" 
})
const defaultItems=[item1,item2,item3];


app.get("/", function(req, res) {
  Item.find(function(err,result){
    if(result.length===0){
      Item.insertMany(defaultItems,function(err){
        if (err){
          console.log(err);
        }
        else{
          console.log("Successfully  added items to the database");
        }
      })
    res.redirect('/');
    }else{
      res.render("list", {listTitle: "Today", newListItems:result});
    }  
});
});
app.post("/",function(req,res){
  const itemName=req.body.newItem
  const itemPage=req.body.list
  const item=new Item({
    name:itemName
  })
  if (itemPage==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
        List.findOne({name:itemPage},function(err,found){
            found.items.push(item);
            found.save();
            res.redirect("/"+itemPage)
        })
  }
});
app.post("/delete",function(req,res){
  const toBeDeletedId=req.body.delete
  const listName=req.body.listName
  if (listName==="Today"){
    Item.findByIdAndRemove(toBeDeletedId,function(err){
      if(!err){
        console.log("Successfully deleted element");
        res.redirect("/");
      }
      else{
        console.log(err)
      }
    });
  }
  else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:toBeDeletedId}}},function(err,result){
      if(!err)
      {
        console.log("deleted")
        res.redirect("/"+listName)
      }
    })
  }
});
const listSchema={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",listSchema)

app.get("/:customListItem",function(req,res){
  const customListName=_.capitalize(req.params.customListItem)
  
  

  List.findOne({name:customListName},function(err,result){
    
    if(!err){
      if(!result){
        console.log("couldn't find")
        const list=List({
          name:customListName,
          items:defaultItems
        })
        list.save();
        res.redirect("/"+customListName)
      }
      else{
        
        res.render("list", {listTitle:result.name, newListItems:result.items})
      }
    }
  });
})
let port=process.env.PORT;
if(port===null || port===""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
})
