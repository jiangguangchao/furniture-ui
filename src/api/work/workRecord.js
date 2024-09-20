import request from '@/utils/request'

// 查询工作记录列表
export function listWorkRecord(query) {
  return request({
    url: '/work/workRecord/list',
    method: 'get',
    params: query
  })
}

// 查询工作记录详细
export function getWorkRecord(id) {
  return request({
    url: '/work/workRecord/' + id,
    method: 'get'
  })
}

// 新增工作记录
export function addWorkRecord(data) {
  return request({
    url: '/work/workRecord',
    method: 'post',
    data: data
  })
}

// 修改工作记录
export function updateWorkRecord(data) {
  return request({
    url: '/work/workRecord',
    method: 'put',
    data: data
  })
}

// 删除工作记录
export function delWorkRecord(id) {
  return request({
    url: '/work/workRecord/' + id,
    method: 'delete'
  })
}
