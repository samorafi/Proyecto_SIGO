// src/components/CuatrimestrePicker.jsx
import { Card, Typography, Select, Option, Button } from "@material-tailwind/react";

function getCurrentCuatri(date = new Date()) {
  const m = date.getMonth(); // 0..11
  const q = m <= 3 ? "I" : m <= 7 ? "II" : "III";
  const year = date.getFullYear().toString();
  return { q, year };
}

export default function CuatrimestrePicker({ value, onChange, yearsBack = 2, yearsForward = 1 }) {
  const now = getCurrentCuatri();
  const currentYear = parseInt(now.year, 10);

  const years = [];
  for (let y = currentYear - yearsBack; y <= currentYear + yearsForward; y++) years.push(String(y));

  const setActual = () => onChange(now);
  const setAnterior = () => {
    // anterior cuatri (I->III del año anterior)
    const order = ["I", "II", "III"];
    const idx = order.indexOf(now.q);
    if (idx === 0) onChange({ q: "III", year: String(currentYear - 1) });
    else onChange({ q: order[idx - 1], year: now.year });
  };

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-3">
        <Typography className="font-semibold text-[#2B338C]">Filtrar por cuatrimestre</Typography>
        <div className="flex gap-2">
          <Button size="sm" variant="text" className="text-[#2B338C]" onClick={setActual}>
            Actual
          </Button>
          <Button size="sm" variant="text" className="text-[#2B338C]" onClick={setAnterior}>
            Anterior
          </Button>
          <Button
            size="sm"
            className="bg-[#FFDA00] text-[#2B338C]"
            onClick={() => onChange({ q: "Todos", year: "Todos" })}
          >
            Todos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Cuatrimestre"
          value={value.q}
          onChange={(v) => onChange({ ...value, q: v })}
        >
          <Option value="Todos">Todos</Option>
          <Option value="I">I</Option>
          <Option value="II">II</Option>
          <Option value="III">III</Option>
        </Select>

        <Select
          label="Año"
          value={value.year}
          onChange={(v) => onChange({ ...value, year: v })}
        >
          <Option value="Todos">Todos</Option>
          {years.map((y) => (
            <Option key={y} value={y}>{y}</Option>
          ))}
        </Select>
      </div>
    </Card>
  );
}
