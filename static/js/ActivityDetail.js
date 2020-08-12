// 构建签到后显示的字段
var buildSignFields = (signFields, activityfields, attendeeInfo) => {
  // 固定字段
  var fixedFields = [
    {
      key: 'sex',
      name: '性别',
      value: !!attendeeInfo.sex
        ? attendeeInfo.sex === 1
          ? '男'
          : '女'
        : '未定义'
    },
    {
      key: 'work',
      name: '单位',
      value: attendeeInfo.work
    },
    {
      key: 'job',
      name: '职位',
      value: attendeeInfo.job
    },
    {
      key: 'group',
      name: '组别',
      value: attendeeInfo.group ? attendeeInfo.group.name : '未分组'
    },
    {
      key: 'ticket',
      name: '票种',
      value: attendeeInfo.ticket ? attendeeInfo.ticket.name : '未定义'
    },
    {
      key: 'signCode',
      name: '签到码',
      value: attendeeInfo.signCode
    }
  ];

  // 动态添加字段
  const allFields = activityfields.map((field) => {
    return {
      key: field.id,
      name: field.name,
      value: ''
    };
  });

  // 构建参会人员显示字段
  let buildFieldValus = [];
  if (attendeeInfo.fieldValues) {
    buildFieldValus = attendeeInfo.fieldValues.map((val) => {
      return {
        key: val.fieldId,
        name: val.field.name,
        value: val.value
      };
    });
  }
  const merchedFields = [...fixedFields, ...allFields];

  const showFields = merchedFields.filter((filter) =>
    signFields.includes(filter.key)
  );

  return showFields.map((field) => {
    const temp = buildFieldValus.filter((f) => f.key === field.key);
    if (temp.length > 0) {
      field.value = temp[0].value;
    }
    return field;
  });
};

var signRecord = (record) => {
  if (record) {
    return record.reverse();
  } else {
    return [];
  }
};

export default {
  buildSignFields,
  signRecord
};
