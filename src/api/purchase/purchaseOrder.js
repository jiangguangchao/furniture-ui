import request from '@/utils/request'

// 查询进货单列表
export function listPurchaseOrder(query) {
  return request({
    url: '/purchase/purchaseOrder/list',
    method: 'get',
    params: query
  })
}

// 查询进货单详细
export function getPurchaseOrder(id) {
  return request({
    url: '/purchase/purchaseOrder/' + id,
    method: 'get'
  })
}

// 新增进货单
export function addPurchaseOrder(data) {
  return request({
    url: '/purchase/purchaseOrder',
    method: 'post',
    data: data
  })
}

// 修改进货单
export function updatePurchaseOrder(data) {
  return request({
    url: '/purchase/purchaseOrder',
    method: 'put',
    data: data
  })
}

// 删除进货单
export function delPurchaseOrder(id) {
  return request({
    url: '/purchase/purchaseOrder/' + id,
    method: 'delete'
  })
}
