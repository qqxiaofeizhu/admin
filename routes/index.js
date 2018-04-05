var express = require('express');
var router = express.Router();
/**
 * 中间件处理
 */
var middleware = require('../middleware/entryAllOrigin');
var token = require('../middleware/checkToken');
var indexApi = require('./indexApi');
var list = require('./list');
router.all('*', middleware.entryAllOrigin);
/**
 * api接口 ------- get请求
 */

// router.get('/', indexApi.getBookstore);
// 获取录入数据接口
router.get('/get-all-book-entry', list.getAllBookEntry);
/**
  * api接口 ------post请求
  */
//  登录接口
router.post('/login', indexApi.Login);
// 添加图书接口
router.post('/add-book-list', list.addBookList);
router.post('/get-book-list', list.getBookList);
// 删除图书接口
router.post('/delate-booklist-by-id', list.delateBooklistById);
// 编辑图书接口
router.post('/editor-select-book-name', list.editorSelectBookName);
router.get('/list')
module.exports = router;
