import { Tabs, TabsHeader, Tab } from "@material-tailwind/react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OfertasTabs() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = pathname.includes("/virtual") ? "virtual" : "presencial";

  const tabClass = (val) =>
    [
      "px-6 py-2 transition-colors relative z-10",     // <-- z-10 por encima del indicator
      current === val ? "text-white" : "text-[#2B338C]",
    ].join(" ");

  return (
    <Tabs value={current}>
      <TabsHeader
        className="bg-white rounded-lg p-1"
        indicatorProps={{
          className: "bg-[#2B338C] rounded-lg shadow-none z-0", // <-- indicator debajo
        }}
      >
        <Tab
          value="presencial"
          onClick={() => navigate("/dashboard/ofertas/presencial")}
          className={tabClass("presencial")}
        >
          Presencial
        </Tab>

        <Tab
          value="virtual"
          onClick={() => navigate("/dashboard/ofertas/virtual")}
          className={tabClass("virtual")}
        >
          Virtual
        </Tab>
      </TabsHeader>
    </Tabs>
  );
}
