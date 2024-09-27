<template>
  <div class="home">
    <el-row :gutter="20">
      <!-- 第一行 -->
      <el-col :span="24">
        <order-list />
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 第二行 -->
      <el-col :span="12">
        <el-card class="box-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>代办事项</span>
            </div>
          </template>
          <div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近一周订单统计</span>
            </div>
          </template>
          <div class="text item">
            总订单数: {{ recentOrderStats.total }}
          </div>
          <div class="text item">
            平均每天订单数: {{ recentOrderStats.average }}
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import orderList from './orderList.vue'

// 模拟数据
const incompleteOrders = ref([
  { id: 1, name: '订单1', status: '未完成' },
  { id: 2, name: '订单2', status: '未完成' },
  // 更多未完成订单...
]);

const todos = ref([
  { id: 1, task: '任务1' },
  { id: 2, task: '任务2' },
  // 更多代办事项...
]);

const recentOrderStats = ref({
  total: 50,
  average: 7.14
});
</script>

<style scoped>
.home {
  padding: 20px;
}

.box-card {
  height: 300px;
  border: 2px solid #637a71;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}
</style>