import PropTypes from "prop-types";
import { Typography } from "@material-tailwind/react";

export function Footer({ brandName, brandLink, routes, className = "" }) {
  const year = new Date().getFullYear();

  return (
    <footer className={`pt-2 ${className}`}>

      <div className="h-1 w-full rounded-full" style={{ background: "#FFDA00" }} />

      <div className="py-3 px-2 flex w-full flex-wrap items-center justify-center gap-6 md:justify-between text-blue-gray-600">
        
        <Typography variant="small" className="font-normal">
          © {year}{" "}
          {brandLink ? (
            <a href={brandLink} className="font-semibold hover:text-[#2B338C] transition-colors" target="_blank" rel="noreferrer">
              {brandName}
            </a>
          ) : (
            <span className="font-semibold">{brandName}</span>
          )}{" "}
          — Universidad Fidélitas
        </Typography>
      </div>
    </footer>
  );
}

Footer.defaultProps = {
  brandName: "SIGO",
  brandLink: "",
  routes: [
    { name: "Ofertas", to: "/dashboard/ofertas" },
    { name: "Docentes", to: "/dashboard/docentes" },
    { name: "Reportes", to: "/dashboard/reportes" },
  ],
};

Footer.propTypes = {
  brandName: PropTypes.string,
  brandLink: PropTypes.string,               
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      to: PropTypes.string,                  
      href: PropTypes.string,                
    })
  ),
  className: PropTypes.string,
};

Footer.displayName = "/src/widgets/layout/footer.jsx";

export default Footer;
