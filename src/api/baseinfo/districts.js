import request from '@/utils/request'

// 查询行政区划列表
export function listDistricts(query) {
  return request({
    url: '/baseinfo/districts/list',
    method: 'get',
    params: query
  })
}

// 查询行政区划详细
export function getDistricts(code) {
  return request({
    url: '/baseinfo/districts/' + code,
    method: 'get'
  })
}

// 新增行政区划
export function addDistricts(data) {
  return request({
    url: '/baseinfo/districts',
    method: 'post',
    data: data
  })
}

// 修改行政区划
export function updateDistricts(data) {
  return request({
    url: '/baseinfo/districts',
    method: 'put',
    data: data
  })
}

// 删除行政区划
export function delDistricts(code) {
  return request({
    url: '/baseinfo/districts/' + code,
    method: 'delete'
  })
}
