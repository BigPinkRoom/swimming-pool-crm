export default class RelativeEntity {
  constructor({ context } = {}) {
    this.context = context;

    const { $i18n } = useNuxtApp();
    this.t = $i18n.t;
  }

  createNewRelative = (id) => ({
    id: id,
    name: "",
    surname: "",
    patronymic: "",
    type: "",
    telephone: null,
  });

  checkValuesForValidateReset = (currentTempRelative) => {
    const fieldsCheck = [
      Boolean(currentTempRelative.value.name),
      Boolean(currentTempRelative.value.surname),
      Boolean(currentTempRelative.value.patronymic),
      Boolean(currentTempRelative.value.type),
      Boolean(currentTempRelative.value.telephone),
    ].every((field) => field === false);

    return fieldsCheck;
  };

  setRelativeTypeName(name) {
    const names = {
      mother: "mother",
      father: "father",
      grandmother: "grandmother",
      grandfather: "grandfather",
      brother: "brother",
      sister: "sister",
      aunt: "aunt",
      uncle: "uncle",
      cousin_brother: "cousinBrother",
      cousin_sister: "cousinSister",
      other: "other",
    };

    return names[name] || null;
  }

  setRelativeTypeId(id) {
    return id;
  }

  setRelativeTypeTranslate(type) {
    return this.t(
      `forms.client.add.fieldsets.relatives.fields.type.options.${type}`
    );
  }
}
