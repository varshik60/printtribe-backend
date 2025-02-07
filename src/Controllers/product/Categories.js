import mongoose from "mongoose";
import { decode } from 'node-base64-image';
import Categories from "../../models/categories";
import ParseErrors from "../../utils/ParseErrors";


export const add_Categories = async (req, res) => {
    let { data } = req.body;
    let dateVal = Date.now();
    try {
        await decode(data.img, { fname: './uploads/'+ dateVal + data.name.replace(/ |'/g,"_").toLowerCase(), ext: data.extension });
        data.img = '/uploads/'+ dateVal + data.name.replace(/ |'/g,"_")+"."+data.extension
        const categories = new Categories({
            _id: mongoose.Types.ObjectId(),
            category: data.name,
            url: data.url,
            img: data.img,
            colors: data.colors,
            sizes: data.sizes,
            maincat: data.maincat,
            subcat: data.subcat,
            zakekeSides: data.zakekeSides
        });
        let result_display = ""
        result_display = await categories.save().then((categoriesValue) => {
            console.log('categories response ->'+categoriesValue)
            return categoriesValue;
        })
            .catch((err) => res.status(400).json({ errors: ParseErrors(err.errors) }));
            console.log(result_display);
            if(result_display) {
                const categoriesValue = {
                    id: result_display._id,
                    name: result_display.category,
                    url: result_display.url,
                    img: result_display.img,
                    colors: result_display.colors,
                    sizes: result_display.sizes,
                    maincat: result_display.maincat,
                    subcat: result_display.subcat,
                    zakekeSides: result_display.zakekeSides,                    
                };
                res.status(201).json({ categoriesValue });
            }
    }
    catch(err) {
        res.status(400).json({ errors: err.toString() })
    }
}

export const get_Categories = async (req, res) => {

    const maincat = await Categories.find()
        .where('maincat', '0')
        .where('subcat', '0')
        .exec()
        .then((result) => {
            const response = {
                categories: result.map((categoriesdata) => ({
                    id: categoriesdata._id,
                    name: categoriesdata.category,
                    url: categoriesdata.url,
                    img: categoriesdata.img,
                    colors: categoriesdata.colors,
                    sizes: categoriesdata.sizes,
                    zakekeSides: categoriesdata.zakekeSides,
                    maincat: categoriesdata.maincat,
                    subcat: categoriesdata.subcat,
                    subCategories: []
                }))
            }
            return response;
        });
    if (Array.isArray(maincat.categories) && maincat.categories.length) {
        await Promise.all(maincat.categories.map(async (item, key) => {
            const subcat = await Categories.find()
                .where('maincat', item.id)
                .where('subcat', '0')
                .exec()
                .then((resultsub) => {
                    const response = {
                        subcategories: resultsub.map((subcategoriesdata) => ({
                            id: subcategoriesdata._id,
                            name: subcategoriesdata.category,
                            url: subcategoriesdata.url,
                            img: subcategoriesdata.img,
                            colors: subcategoriesdata.colors,
                            sizes: subcategoriesdata.sizes,
                            zakekeSides: subcategoriesdata.zakekeSides,
                            maincat: subcategoriesdata.maincat,
                            subcat: subcategoriesdata.subcat
                        }))
                    }
                    maincat.categories[key]["subCategories"] = response.subcategories;
                });
                if (Array.isArray(maincat.categories[key].subCategories) && maincat.categories.length) {
                    await Promise.all(maincat.categories[key].subCategories.map(async (itemsub, keysub) => {
                        const subsubcat = await Categories.find()
                        .where('maincat', item.id)
                        .where('subcat', itemsub.id)
                        .exec()
                        .then((resultsubsub) => {
                            const responsesub = {
                                subsubcategories: resultsubsub.map((subsubcategoriesdata) => ({
                                    id: subsubcategoriesdata._id,
                                    name: subsubcategoriesdata.category,
                                    url: subsubcategoriesdata.url,
                                    img: subsubcategoriesdata.img,
                                    colors: subsubcategoriesdata.colors,
                                    sizes: subsubcategoriesdata.sizes,
                                    zakekeSides: subsubcategoriesdata.zakekeSides,
                                    maincat: subsubcategoriesdata.maincat,
                                    subcat: subsubcategoriesdata.subcat
                                }))
                            }
                            maincat.categories[key].subCategories[keysub]["subsubCategories"] = responsesub.subsubcategories;                          
                        });
                    }))
                }
        }))
    }
    res.status(201).json({ maincat });
}

export const get_CategoryById = async (req,res) => {
    const category = await Categories.find({'_id':req.params.id})
    .exec().
    then((categorydata)=>{
        const response = {
            count:categorydata.length,
            categorydata:categorydata.map((categoryrecord)=>({
                id:categoryrecord._id,
                name: categoryrecord.category,
                url: categoryrecord.url,
                img: categoryrecord.img,
                colors: categoryrecord.colors,
                sizes: categoryrecord.sizes,
                zakekeSides: categoryrecord.zakekeSides,
                maincat: categoryrecord.maincat,
                subcat: categoryrecord.subcat,
                subCategories: [],
                subsubCategories: []
            }))
        }
        return response;
    })
    .catch((err)=>{
        res.status(500).json({error:{global:"something went wrong"}});
    });
    if (Array.isArray(category.categorydata) && category.count) {
        console.log('main category id:'+category.categorydata[0].maincat);
        if(category.categorydata[0].maincat == '0' && category.categorydata[0].subcat == '0')
        {
            delete category.categorydata[0].subsubCategories;
            await Promise.all(category.categorydata.map(async (item, key) => {
                const subcat = await Categories.find()
                    .where('maincat', item.id)
                    .where('subcat', '0')
                    .exec()
                    .then((resultsub) => {
                        const response = {
                            subcategories: resultsub.map((subcategoriesdata) => ({
                                id: subcategoriesdata._id,
                                name: subcategoriesdata.category,
                                url: subcategoriesdata.url,
                                img: subcategoriesdata.img,
                                colors: subcategoriesdata.colors,
                                sizes: subcategoriesdata.sizes,
                                zakekeSides: subcategoriesdata.zakekeSides,
                                maincat: subcategoriesdata.maincat,
                                subcat: subcategoriesdata.subcat
                            }))
                        }
                        category.categorydata[key]["subCategories"] = response.subcategories;
                    });
                    if (Array.isArray(category.categorydata[key].subCategories) && category.categorydata[key].subCategories.length) {
                        await Promise.all(category.categorydata[key].subCategories.map(async (itemsub, keysub) => {
                            const subsubcat = await Categories.find()
                            .where('maincat', item.id)
                            .where('subcat', itemsub.id)
                            .exec()
                            .then((resultsubsub) => {
                                const responsesub = {
                                    subsubcategories: resultsubsub.map((subsubcategoriesdata) => ({
                                        id: subsubcategoriesdata._id,
                                        name: subsubcategoriesdata.category,
                                        url: subsubcategoriesdata.url,
                                        img: subsubcategoriesdata.img,
                                        colors: subsubcategoriesdata.colors,
                                        sizes: subsubcategoriesdata.sizes,
                                        zakekeSides: subsubcategoriesdata.zakekeSides,
                                        maincat: subsubcategoriesdata.maincat,
                                        subcat: subsubcategoriesdata.subcat
                                    }))
                                }
                                category.categorydata[key].subCategories[keysub]["subsubCategories"] = responsesub.subsubcategories;                          
                            });
                        }))
                    }
            }))
        }
        else if(category.categorydata[0].maincat != '0' && category.categorydata[0].subcat == '0')
        {
            delete category.categorydata[0].subCategories;
            await Promise.all(category.categorydata.map(async (itemsub, key) => {
                const subsubcat = await Categories.find()
                .where('maincat', category.categorydata[0].maincat)
                .where('subcat', itemsub.id)
                .exec()
                .then((resultsubsub) => {
                    const responsesub = {
                        subsubcategories: resultsubsub.map((subsubcategoriesdata) => ({
                            id: subsubcategoriesdata._id,
                            name: subsubcategoriesdata.category,
                            url: subsubcategoriesdata.url,
                            img: subsubcategoriesdata.img,
                            colors: subsubcategoriesdata.colors,
                            sizes: subsubcategoriesdata.sizes,
                            zakekeSides: subsubcategoriesdata.zakekeSides,
                            maincat: subsubcategoriesdata.maincat,
                            subcat: subsubcategoriesdata.subcat
                        }))
                    }
                    category.categorydata[key]["subsubCategories"] = responsesub.subsubcategories;                          
                });
            }))
        }
        else if(category.categorydata[0].maincat != '0' && category.categorydata[0].subcat != '0')
        {
            delete category.categorydata[0].subsubCategories;
            delete category.categorydata[0].subCategories;
        }
    }
    res.status(200).json({category:category});
}

export const update_categories = async (req,res) => {
    let data = req.body.data;
    const id = data.id;
    if(data.name) {
        data.category = data.name
    }
    if(data.img) {
        let dateVal = Date.now();
        await decode(data.img, { fname: './uploads/'+ dateVal + data.name.replace(/ |'/g,"_").toLowerCase(), ext: data.extension });
        data.img = '/uploads/'+ dateVal + data.name.replace(/ |'/g,"_")+"."+data.extension
    }
    Categories.updateOne({_id: id}, {$set: data}).exec().then((userRecord)=>{
        res.status(200).json({success:{global:"Categorie updated successfully"}})
    }).catch((err)=>{
        res.status(400).json({error:{global:"something went wrong"}});
    })
}

export const delete_Category = (req,res) => {
    const id = req.params.id;
    Categories.deleteOne({_id: id},function(err,data){
        if(err){
            console.log(err);
            res.send('error');
        }
        else
        {
            console.log(data);
            return res.send('success')
        }
    });
}

export default { add_Categories, get_Categories, update_categories, delete_Category, get_CategoryById }

