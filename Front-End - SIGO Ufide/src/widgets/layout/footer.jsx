import PropTypes from "prop-types";
import { Typography } from "@material-tailwind/react";
import { Link } from "react-router-dom";

export function Footer({ brandName, brandLink, routes, className = "" }) {
  const year = new Date().getFullYear();

  return (
    <footer className={`pt-2 ${className}`}>
      {/* franja amarilla superior */}
      <div className="h-1 w-full rounded-full" style={{ background: "#FFDA00" }} />

      <div className="py-3 px-2 flex w-full flex-wrap items-center justify-center gap-6 md:justify-between text-blue-gray-600">
        {/* Texto izquierdo */}
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

        {/* Enlaces (internos o externos) */}
        {routes?.length > 0 && (
          <ul className="flex items-center gap-4">
            {routes.map(({ name, to, href }) => (
              <li key={name}>
                {to ? (
                  <Typography
                    as={Link}
                    to={to}
                    variant="small"
                    className="py-0.5 px-1 font-normal hover:text-[#2B338C] transition-colors"
                  >
                    {name}
                  </Typography>
                ) : (
                  <Typography
                    as="a"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    variant="small"
                    className="py-0.5 px-1 font-normal hover:text-[#2B338C] transition-colors"
                  >
                    {name}
                  </Typography>
                )}
              </li>
            ))}
          </ul>
        )}
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
