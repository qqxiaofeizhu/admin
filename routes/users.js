var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var data = {
    name : '宋将炜',
    age: 20,
    school: '安阳工学院',
    major: '网络工程',
    girlFriend: '吕林园'
  }
  res.json({
    type: true,
    data: data,
    message: '响应成功'
  })
});


module.exports = router;
