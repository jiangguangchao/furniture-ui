<template>
  <div>
    <el-tabs type="border-card" @tab-click="ckickTab" v-model="activeName">
      <el-tab-pane label="进货单信息" lazy>
        <purchaseOrderDetail :purchaseOrder="purchaseOrder" />
      </el-tab-pane>
      <el-tab-pane label="支付信息" lazy>
        <paymentRecored :order="purchaseOrder" :PrAssociationType="'PO'"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import purchaseOrderDetail from "./purchaseOrderDetail.vue"
import paymentRecored from "./paymentRecord.vue"

// 接收 props
const props = defineProps({
  purchaseOrder: {
    type: Object,
    required: true,
  },
});

// var newPurchaseOrder = props.purchaseOrder

// watch(() => props.purchaseOrder, () => {
//   console.log("watch purchaseOrder", props.purchaseOrder)
//   newPurchaseOrder = props.purchaseOrder
// });

console.log("详情页收到的进货单", props.purchaseOrder)
</script>