import config from '../common/config';

export default function(req, res, next) {
    const userId = req.session[config.session.fieldToSaveSession];
    if(!userId) {
        res.redirect('/');
    } else {
        next();
    };
};

// Validate user session, when name of session storage in config.session.fieldToSaveSession;