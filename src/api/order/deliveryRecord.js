import request from '@/utils/request'

// 查询配送记录列表
export function listDeliveryRecord(query) {
  return request({
    url: '/order/deliveryRecord/list',
    method: 'get',
    params: query
  })
}

// 查询配送记录详细
export function getDeliveryRecord(id) {
  return request({
    url: '/order/deliveryRecord/' + id,
    method: 'get'
  })
}

// 新增配送记录
export function addDeliveryRecord(data) {
  return request({
    url: '/order/deliveryRecord',
    method: 'post',
    data: data
  })
}

// 修改配送记录
export function updateDeliveryRecord(data) {
  return request({
    url: '/order/deliveryRecord',
    method: 'put',
    data: data
  })
}

// 删除配送记录
export function delDeliveryRecord(record) {
  return request({
    url: '/order/deliveryRecord/delete',
    method: 'delete',
    data: record
  })
}
