const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dispatchCompanySchema = new Schema({
     dispatchCompanyId: {
        type: String,
        unique: true,
        required: true
    },
    name:
    {
        type: String,
        required: true
    },
    contactPerson:
    {
        type: String
    },
    email:
    {
        type: String,
        required: true
    },
    phoneNumber:
    {
        type: String
    },
    address:
    {
        type: String
    },
    operatingAreas:
    {
        type: [String] // Array of regions or zones
    }, 
    deliveryCapacity:
    {
        type: String
    },
    deliveryTimeframes:
    {
        type: String
    },
    serviceDescription:
    {
        type: String
    },
    registrationNumber:
    {
        type: String
    },
    insuranceInfo:
    {
        type: String
    },
    complianceCertifications:
    {
        type: String
    },
    // apiIntegrationDetails:
    // {
    //     endpoint: { type: String },
    //     authentication: { type: String },
    // },
    technicalContact:
    {
        name: { type: String },
        email: { type: String },
        phoneNumber: { type: String },
    },
    logoUrl:
    {
        type: String
    },
    termsOfServiceUrl:
    {
        type: String
    },
    paymentTerms:
    {
        type: String
    },
       userType:
    {
        type: String,
        enum: ['public-user', 'pharmacy', 'rider'],
    },
        role:
    {
        type: String,
        enum: ['user', 'admin', 'super-admin'],
        required: true
    },
});

const DispatchCompany = mongoose.model('DispatchCompany', dispatchCompanySchema);

module.exports = DispatchCompany;
