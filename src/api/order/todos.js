import request from '@/utils/request'

// 查询待办事项列表
export function listTodos(query) {
  return request({
    url: '/order/todos/list',
    method: 'get',
    params: query
  })
}

// 查询待办事项详细
export function getTodos(id) {
  return request({
    url: '/order/todos/' + id,
    method: 'get'
  })
}

// 新增待办事项
export function addTodos(data) {
  return request({
    url: '/order/todos',
    method: 'post',
    data: data
  })
}

// 修改待办事项
export function updateTodos(data) {
  return request({
    url: '/order/todos',
    method: 'put',
    data: data
  })
}

// 删除待办事项
export function delTodos(id) {
  return request({
    url: '/order/todos/' + id,
    method: 'delete'
  })
}
