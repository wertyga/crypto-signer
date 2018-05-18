import isEmpty from 'lodash/isEmpty';

export default function(data, blankField = 'Field can not be blank') {
    const errors = {};

    Object.keys(data).forEach(item => {
        if(item.replace(/' '|-/g, '').toLowerCase() === 'email' && data[item].field && !validateEmail(data[item].field)) {
            errors[item] = "Seems like it not an E-mal address";
        }
        if(data[item].require && !data[item].field) {
            errors[item] = blankField;
        }
    });

    return {
        isValid: isEmpty(errors),
        errors
    }
};

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Validate user's inputs, fields that require.
// Data for validation must be an object type of:
// { [fieldName]: { field: 'Some fieldName', require: true/false } }

// BlankField is an argument for error notification