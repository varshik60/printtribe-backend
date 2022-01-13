import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";


const designIdSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    variantProductId: {type:String,required:true},
    customerUniqueId: {type:String,required:true},
    designId: {type:String,required:true},
},{ timestamps:true });

designIdSchema.plugin(uniqueValidator);

export default mongoose.model("designId", designIdSchema);