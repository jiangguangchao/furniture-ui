<template>
  <div>
    <el-tabs type="border-card" @tab-click="ckickTab" v-model="activeName">
      <el-tab-pane label="订单基本信息" lazy>
        <orderDetail :order="order" />
      </el-tab-pane>
      <el-tab-pane label="订单中家具信息" lazy>
        <furnitureList :order="order" />
      </el-tab-pane>
      <el-tab-pane label="支付信息" lazy>
      </el-tab-pane>
      <el-tab-pane label="配送信息" lazy>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import orderDetail from "./orderDetail.vue"
import furnitureList from "./furnitureList.vue"

// 接收 props
const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});
</script>