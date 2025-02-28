import request from '@/utils/request'

// 查询进货单明细列表
export function listPurchaseOrderItem(query) {
  return request({
    url: '/purchase/purchaseOrderItem/list',
    method: 'get',
    params: query
  })
}

// 查询进货单明细详细
export function getPurchaseOrderItem(id) {
  return request({
    url: '/purchase/purchaseOrderItem/' + id,
    method: 'get'
  })
}

// 新增进货单明细
export function addPurchaseOrderItem(data) {
  return request({
    url: '/purchase/purchaseOrderItem',
    method: 'post',
    data: data
  })
}

// 修改进货单明细
export function updatePurchaseOrderItem(data) {
  return request({
    url: '/purchase/purchaseOrderItem',
    method: 'put',
    data: data
  })
}

// 删除进货单明细,将整个对象传过去，而不是仅仅传id，因为其他属性值，比如家具类型，会被后台用到
export function delPurchaseOrderItem(data) {
  return request({
    url: '/purchase/purchaseOrderItem',
    method: 'delete',
    data: data
  })
}
