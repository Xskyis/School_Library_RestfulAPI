/** load model for `members` table */
const memberModel = require(`../models/index`).member

/** load member validation */
const memberValidation = require(`../middlewares/member-validation`)

/** load Operation from Sequelize */
const Op = require(`sequelize`).Op
const path = require('path')
const fs = require('fs')

const upload = require(`./upload-profile`).single(`profile`)

/** create function for read all data */
exports.getAllMember = async (request, response) => {
    /** call findAll() to get all data */
    let members = await memberModel.findAll()
    return response.json({
        success: true, data: members,
        message: `All Members have been loaded`
    })
}

/** create function for filter */
exports.findMember = async (request, response) => {
    /** define keyword to find data */
    let keyword = request.body.keyword

    /** call findAll() within where clause and operation 
     ** to find data based on keyword */
    let members = await memberModel.findAll({
        where: {
            [Op.or]: [
                { name: { [Op.substring]: keyword } },
                { gender: { [Op.substring]: keyword } },
                { address: { [Op.substring]: keyword } }
            ]
        }
    })
    return response.json({
        success: true, data: members,
        message: `All Members have been loaded`
    })
}

/** create function for add new member */
exports.addMember = (request, response) => {
    /** run function upload */
    upload(request, response, async error => {
        /** check if there are errorwhen upload */
        if (error) {
            return response.json({ message: error })
        }
        /** check if file is empty */
        if (!request.file) {
            return response.json({
                message: `Nothing to Upload`
            })
        }

        /** proses validasi */
        let resultValidation = memberValidation(request)
        if (! resultValidation.status) {  
            return response.json({  
                status: false,
                message: resultValidation.message
            })
        }

        /** prepare data from request */
        let newMember = {
            name: request.body.name,
            address: request.body.address,
            gender: request.body.gender,
            contact: request.body.contact,
            profile: request.file.filename
        }

        /** execute inserting data to member's table */
        memberModel.create(newMember)
            .then(result => {
                /** if insert's process success */
                return response.json({
                    success: true,
                    data: result,
                    message: `New member has been inserted`
                })
            })
            .catch(error => {
                /** if insert's process fail */
                return response.json({
                    success: false,
                    message: error.message
                })
            })
    })
}

/** create function for update member */
exports.updateMember = (request, response) => {
    /** run upload function */
    upload(request, response, async error => {
        /** check if there are error when upload */
        if (error) {
            return response.json({ message: error })
        }
        /** store selected book ID that will update */
        let id = request.params.id
        /** prepare book's data that will update */
        let member = {
            name: request.body.name,
            address: request.body.address,
            gender: request.body.gender,
            contact: request.body.contact,
        }
        /** check if file is not empty,
        * it means update data within reupload file
        */
        if (request.file) {
            /** get selected book's data */
            const selectedMember = await memberModel.findOne({
                where: { id: id }
            })
            /** get old filename of cover file */
            const oldProfileMember = selectedMember.profile
            /** prepare path of old cover to delete file */
            const pathProfile = path.join(__dirname, `../profile`,
                oldProfileMember)
            /** check file existence */
            if (fs.existsSync(pathProfile)) {
                /** delete old cover file */
                fs.unlink(pathProfile, error =>
                    console.log(error))
            }
            /** add new cover filename to book object */
            member.profile = request.file.filename
        }
        /** execute update data based on defined id book */
        memberModel.update(member, { where: { id: id } })
            .then(result => {
                /** if update's process success */
                return response.json({
                    success: true,
                    message: `Data member has been updated`
                })
            })
            .catch(error => {
                /** if update's process fail */
                return response.json({
                })
            })
    })
}

/** create function for delete data */
exports.deleteMember = async (request, response) => {
    /** define id member that will be update */
    let idMember = request.params.id
    /** -- delete cover file -- */
    /** get selected book's data */
    const member = await memberModel.findOne({ where: { id: idMember } })
    /** get old filename of cover file */
    const oldProfileMember = member.profile
    /** prepare path of old cover to delete file */
    const pathProfile = path.join(__dirname, `../profile`,
        oldProfileMember)
    /** check file existence */
    if (fs.existsSync(pathProfile)) {
        /** delete old cover file */
        fs.unlink(pathProfile, error => console.log(error))
    }

    /** execute delete data based on defined id member */
    memberModel.destroy({ where: { id: idMember } })
        .then(result => {
    /** if update's process success */ return response.json({
            success: true,
            message: `Data member has been updated`
        })
        })
        .catch(error => {
            /** if update's process fail */
            return response.json({
                success: false,
                message: error.message
            })
        })
}



