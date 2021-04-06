exports.get404 = (req, res, next) => {
    res.status(404).render('404', { title:"Error page",pageTitle: 'Page Not Found',youAreRegistered:false,connected:false, path : '' });
};
