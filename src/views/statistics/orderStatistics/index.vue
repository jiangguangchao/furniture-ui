<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="统计日期" prop="statcDate">
        <el-input
          v-model="queryParams.statcDate"
          placeholder="请输入统计日期"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['statistics:orderStatistics:add']"
        >指定日期统计</el-button>
      </el-col>
      
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['statistics:orderStatistics:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderStatisticsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="统计日期" align="center" prop="statcDate" />
      <el-table-column label="数据类型" align="center" prop="dataType" >
        <template #default="scope">
          <dict-tag :options="order_statc_data_type" :value="scope.row.dataType"/>
        </template>
      </el-table-column>
      <el-table-column label="统计值" align="center" prop="statcValue" />
      
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 指定日期订单统计对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="orderStatisticsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="日期类型" prop="dateType">
          <el-select v-model="form.dateType" multiple placeholder="请选择日期类型">
            <el-option
              v-for="item in dateTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="统计日期" prop="statcDateRange">
          <el-date-picker
            v-model="form.statcDateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="OrderStatistics">
import { listOrderStatistics, getOrderStatistics, statcByDate } from "@/api/statistics/orderStatistics";

const { proxy } = getCurrentInstance();
const { order_statc_data_type } = proxy.useDict('order_statc_data_type');

const orderStatisticsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {
    dateType: [],
    statcDateRange: []
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    statcDate: null,
    dataType: null,
  },
  rules: {
    statcDateRange: [
      { required: true, message: "统计日期不能为空", trigger: "change" }
    ],
    dateType: [
      { required: true, message: "日期类型不能为空", trigger: "change" }
    ]
  },
  dateTypeOptions: [
    { value: 'D', label: '日' },
    { value: 'M', label: '月' },
    { value: 'Y', label: '年' }
  ]
});

const { queryParams, form, rules, dateTypeOptions } = toRefs(data);

/** 查询订单统计列表 */
function getList() {
  loading.value = true;
  listOrderStatistics(queryParams.value).then(response => {
    orderStatisticsList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    statcDate: null,
    dataType: null,
    statcValue: null
  };
  proxy.resetForm("orderStatisticsRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "订单统计";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getOrderStatistics(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改订单统计";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderStatisticsRef"].validate(valid => {
    if (valid) {

      const dto = {
        dateTypeList: form.value.dateType,
        startDate: form.value.statcDateRange[0],
        endDate: form.value.statcDateRange[1]
      };

      statcByDate(dto).then(response => {
        proxy.$modal.msgSuccess("统计成功");
      });
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除订单统计编号为"' + _ids + '"的数据项？').then(function() {
    return delOrderStatistics(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('statistics/orderStatistics/export', {
    ...queryParams.value
  }, `orderStatistics_${new Date().getTime()}.xlsx`)
}

getList();
</script>
