<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="员工编号" prop="workerId">
        <el-input
          v-model="queryParams.workerId"
          placeholder="请输入员工编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工作日期" style="width: 308px">
        <el-date-picker
          v-model="daterangeWorkDate"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="工作时间段" prop="workPeriod">
        <el-select v-model="queryParams.workPeriod" placeholder="请选择工作时间段" clearable>
          <el-option
            v-for="dict in work_period"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单编号" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="报酬" prop="salary">
        <el-input
          v-model="queryParams.salary"
          placeholder="请输入报酬"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="加班费" prop="overtimePay">
        <el-input
          v-model="queryParams.overtimePay"
          placeholder="请输入加班费"
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
          v-hasPermi="['work:workRecord:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['work:workRecord:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['work:workRecord:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['work:workRecord:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="workRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="记录编号" align="center" prop="id" />
      <el-table-column label="员工编号" align="center" prop="workerId">
        <template #default="scope">
          <span>{{ userStore.getUserNameById(scope.row.workerId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工作日期" align="center" prop="workDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.workDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工作时间段" align="center" prop="workPeriod">
        <template #default="scope">
          <dict-tag :options="work_period" :value="scope.row.workPeriod"/>
        </template>
      </el-table-column>
      <el-table-column label="配送时间" align="center" prop="deliveryTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deliveryTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单编号" align="center" prop="orderId" />
      <el-table-column label="报酬" align="center" prop="salary" />
      <el-table-column label="加班费" align="center" prop="overtimePay" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['work:workRecord:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['work:workRecord:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改工作记录对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="workRecordRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="员工编号" prop="workerId">
          <el-input v-model="form.workerId" placeholder="请输入员工编号" />
        </el-form-item>
        <el-form-item label="工作日期" prop="workDate">
          <el-date-picker clearable
            v-model="form.workDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择工作日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="工作时间段" prop="workPeriod">
          <el-select v-model="form.workPeriod" placeholder="请选择工作时间段">
            <el-option
              v-for="dict in work_period"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="配送时间" prop="deliveryTime">
          <el-date-picker clearable
            v-model="form.deliveryTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择配送时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="订单编号" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入订单编号" />
        </el-form-item>
        <el-form-item label="报酬" prop="salary">
          <el-input v-model="form.salary" placeholder="请输入报酬" />
        </el-form-item>
        <el-form-item label="加班费" prop="overtimePay">
          <el-input v-model="form.overtimePay" placeholder="请输入加班费" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="WorkRecord">
import { listWorkRecord, getWorkRecord, delWorkRecord, addWorkRecord, updateWorkRecord } from "@/api/work/workRecord";
import useUserStore from '@/store/modules/user'
const userStore = useUserStore()
const { proxy } = getCurrentInstance();
const { work_period } = proxy.useDict('work_period');

const workRecordList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeWorkDate = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    workerId: null,
    workDate: null,
    workPeriod: null,
    orderId: null,
    salary: null,
    overtimePay: null,
  },
  rules: {
    workerId: [
      { required: true, message: "员工编号不能为空", trigger: "blur" }
    ],
    workDate: [
      { required: true, message: "工作日期不能为空", trigger: "blur" }
    ],
    salary: [
      { required: true, message: "报酬不能为空", trigger: "blur" }
    ],
    overtimePay: [
      { required: true, message: "加班费不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询工作记录列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeWorkDate && '' != daterangeWorkDate) {
    queryParams.value.params["beginWorkDate"] = daterangeWorkDate.value[0];
    queryParams.value.params["endWorkDate"] = daterangeWorkDate.value[1];
  }
  listWorkRecord(queryParams.value).then(response => {
    workRecordList.value = response.rows;
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
    workerId: null,
    workDate: null,
    workPeriod: null,
    deliveryTime: null,
    orderId: null,
    salary: null,
    overtimePay: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("workRecordRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeWorkDate.value = [];
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
  title.value = "添加工作记录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getWorkRecord(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改工作记录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["workRecordRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateWorkRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addWorkRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除工作记录编号为"' + _ids + '"的数据项？').then(function() {
    return delWorkRecord(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('work/workRecord/export', {
    ...queryParams.value
  }, `workRecord_${new Date().getTime()}.xlsx`)
}

getList();
</script>
