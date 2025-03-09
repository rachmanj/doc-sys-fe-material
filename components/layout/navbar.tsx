"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useAuth } from "@/hooks/use-auth";
import { deleteCookie } from "@/lib/cookies";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAppTheme } from "@/components/theme/ThemeProvider";

// Material UI imports
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StorageIcon from "@mui/icons-material/Storage";

interface User {
  name: string;
  project: string;
  username: string;
  email: string;
}

export function Navbar() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { mode } = useAppTheme();

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Menu anchor elements
  const [anchorEls, setAnchorEls] = useState<
    Record<string, HTMLElement | null>
  >({
    userMenu: null,
    documents: null,
    deliveries: null,
    masterData: null,
    settings: null,
    mobileMenu: null,
  });

  const handleOpenMenu = (
    menu: string,
    event: React.MouseEvent<HTMLElement>
  ) => {
    // Close any other open menus first
    const newAnchorEls = { ...anchorEls };
    Object.keys(newAnchorEls).forEach((key) => {
      if (key !== menu) newAnchorEls[key] = null;
    });

    // Then open the clicked menu
    newAnchorEls[menu] = event.currentTarget;
    setAnchorEls(newAnchorEls);
  };

  const handleCloseMenu = (menu: string) => {
    setAnchorEls((prev) => ({ ...prev, [menu]: null }));
  };

  const handleCloseAllMenus = () => {
    const newAnchorEls = { ...anchorEls };
    Object.keys(newAnchorEls).forEach((key) => {
      newAnchorEls[key] = null;
    });
    setAnchorEls(newAnchorEls);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCookie("token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    });
  };

  const handleNavigate = (path: string) => {
    // Close all menus
    handleCloseAllMenus();
    router.push(path);
  };

  return (
    <AppBar
      position="fixed"
      color="primary"
      sx={{
        boxShadow: 1,
        height: 48, // Reduced height
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: "48px !important", // Override default height
            py: 0, // Remove padding
          }}
        >
          {/* Logo - Desktop */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/dashboard"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontWeight: 700,
              fontSize: "1rem", // Smaller font size
              color: "inherit",
              textDecoration: "none",
            }}
          >
            IRR-NEXT
          </Typography>

          {/* Mobile menu icon */}
          <Box sx={{ flexGrow: 0, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="small"
              aria-label="menu"
              id="mobile-menu-button"
              aria-controls={
                Boolean(anchorEls.mobileMenu) ? "menu-appbar" : undefined
              }
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEls.mobileMenu) ? "true" : "false"}
              onClick={(e) => handleOpenMenu("mobileMenu", e)}
              color="inherit"
            >
              <MenuIcon fontSize="small" />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEls.mobileMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorEls.mobileMenu)}
              onClose={() => handleCloseMenu("mobileMenu")}
              autoFocus={false}
              disableAutoFocusItem
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {hasPermission("dashboard.index") && (
                <MenuItem onClick={() => handleNavigate("/dashboard")}>
                  <DashboardIcon sx={{ mr: 1 }} fontSize="small" />
                  Dashboard
                </MenuItem>
              )}

              {hasPermission("documents.index") && (
                <MenuItem onClick={() => handleNavigate("/documents/invoices")}>
                  <DescriptionIcon sx={{ mr: 1 }} fontSize="small" />
                  Documents
                </MenuItem>
              )}

              {hasPermission("deliveries.index") && (
                <MenuItem onClick={() => handleNavigate("/deliveries/lpd")}>
                  <LocalShippingIcon sx={{ mr: 1 }} fontSize="small" />
                  Deliveries
                </MenuItem>
              )}

              {hasPermission("settings.index") && (
                <MenuItem onClick={() => handleNavigate("/master/suppliers")}>
                  <StorageIcon sx={{ mr: 1 }} fontSize="small" />
                  Master Data
                </MenuItem>
              )}

              {hasPermission("settings.index") && (
                <MenuItem onClick={() => handleNavigate("/settings/users")}>
                  <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
                  Settings
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Logo - Mobile */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/dashboard"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontWeight: 700,
              fontSize: "1rem", // Smaller font size
              color: "inherit",
              textDecoration: "none",
            }}
          >
            IRR-NEXT
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {hasPermission("dashboard.index") && (
              <Button
                onClick={() => handleNavigate("/dashboard")}
                sx={{
                  my: 0, // Remove vertical margin
                  px: 1.5, // Reduce horizontal padding
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  minHeight: 48, // Match navbar height
                  fontSize: "0.875rem", // Smaller font size
                }}
                startIcon={<DashboardIcon fontSize="small" />}
              >
                Dashboard
              </Button>
            )}

            {hasPermission("documents.index") && (
              <>
                <Button
                  onClick={(e) => handleOpenMenu("documents", e)}
                  id="documents-button"
                  aria-controls={
                    Boolean(anchorEls.documents) ? "documents-menu" : undefined
                  }
                  aria-haspopup="true"
                  aria-expanded={
                    Boolean(anchorEls.documents) ? "true" : "false"
                  }
                  sx={{
                    my: 0,
                    px: 1.5,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    minHeight: 48,
                    fontSize: "0.875rem",
                  }}
                  endIcon={<KeyboardArrowDownIcon fontSize="small" />}
                  startIcon={<DescriptionIcon fontSize="small" />}
                >
                  Documents
                </Button>
                <Menu
                  id="documents-menu"
                  anchorEl={anchorEls.documents}
                  open={Boolean(anchorEls.documents)}
                  onClose={() => handleCloseMenu("documents")}
                  autoFocus={false}
                  disableAutoFocusItem
                  MenuListProps={{
                    "aria-labelledby": "documents-button",
                  }}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                >
                  <MenuItem
                    onClick={() => handleNavigate("/documents/invoices")}
                  >
                    Invoices
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      handleNavigate("/documents/additional-documents")
                    }
                  >
                    Additional Documents
                  </MenuItem>
                </Menu>
              </>
            )}

            {hasPermission("deliveries.index") && (
              <>
                <Button
                  onClick={(e) => handleOpenMenu("deliveries", e)}
                  id="deliveries-button"
                  aria-controls={
                    Boolean(anchorEls.deliveries)
                      ? "deliveries-menu"
                      : undefined
                  }
                  aria-haspopup="true"
                  aria-expanded={
                    Boolean(anchorEls.deliveries) ? "true" : "false"
                  }
                  sx={{
                    my: 0,
                    px: 1.5,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    minHeight: 48,
                    fontSize: "0.875rem",
                  }}
                  endIcon={<KeyboardArrowDownIcon fontSize="small" />}
                  startIcon={<LocalShippingIcon fontSize="small" />}
                >
                  Deliveries
                </Button>
                <Menu
                  id="deliveries-menu"
                  anchorEl={anchorEls.deliveries}
                  open={Boolean(anchorEls.deliveries)}
                  onClose={() => handleCloseMenu("deliveries")}
                  autoFocus={false}
                  disableAutoFocusItem
                  MenuListProps={{
                    "aria-labelledby": "deliveries-button",
                  }}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                >
                  <MenuItem onClick={() => handleNavigate("/deliveries/lpd")}>
                    LPD
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate("/deliveries/spi")}>
                    SPI
                  </MenuItem>
                </Menu>
              </>
            )}

            {hasPermission("settings.index") && (
              <>
                <Button
                  onClick={(e) => handleOpenMenu("masterData", e)}
                  id="master-data-button"
                  aria-controls={
                    Boolean(anchorEls.masterData)
                      ? "master-data-menu"
                      : undefined
                  }
                  aria-haspopup="true"
                  aria-expanded={
                    Boolean(anchorEls.masterData) ? "true" : "false"
                  }
                  sx={{
                    my: 0,
                    px: 1.5,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    minHeight: 48,
                    fontSize: "0.875rem",
                  }}
                  endIcon={<KeyboardArrowDownIcon fontSize="small" />}
                  startIcon={<StorageIcon fontSize="small" />}
                >
                  Master Data
                </Button>
                <Menu
                  id="master-data-menu"
                  anchorEl={anchorEls.masterData}
                  open={Boolean(anchorEls.masterData)}
                  onClose={() => handleCloseMenu("masterData")}
                  autoFocus={false}
                  disableAutoFocusItem
                  MenuListProps={{
                    "aria-labelledby": "master-data-button",
                  }}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                >
                  <MenuItem onClick={() => handleNavigate("/master/suppliers")}>
                    Suppliers
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleNavigate("/master/departments")}
                  >
                    Departments
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleNavigate("/master/invoice-types")}
                  >
                    Invoice Types
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleNavigate("/master/addoc-types")}
                  >
                    AddDoc Types
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleNavigate("/master/upload-ito")}
                  >
                    ITO Upload
                  </MenuItem>
                </Menu>
              </>
            )}

            {hasPermission("settings.index") && (
              <>
                <Button
                  onClick={(e) => handleOpenMenu("settings", e)}
                  id="settings-button"
                  aria-controls={
                    Boolean(anchorEls.settings) ? "settings-menu" : undefined
                  }
                  aria-haspopup="true"
                  aria-expanded={Boolean(anchorEls.settings) ? "true" : "false"}
                  sx={{
                    my: 0,
                    px: 1.5,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    minHeight: 48,
                    fontSize: "0.875rem",
                  }}
                  endIcon={<KeyboardArrowDownIcon fontSize="small" />}
                  startIcon={<SettingsIcon fontSize="small" />}
                >
                  Settings
                </Button>
                <Menu
                  id="settings-menu"
                  anchorEl={anchorEls.settings}
                  open={Boolean(anchorEls.settings)}
                  onClose={() => handleCloseMenu("settings")}
                  autoFocus={false}
                  disableAutoFocusItem
                  MenuListProps={{
                    "aria-labelledby": "settings-button",
                  }}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                >
                  <MenuItem onClick={() => handleNavigate("/settings/users")}>
                    Users
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate("/settings/roles")}>
                    Roles
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleNavigate("/settings/permissions")}
                  >
                    Permissions
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {/* Theme Toggle */}
          <Box sx={{ mr: 1 }}>
            <ThemeToggle />
          </Box>

          {/* User Menu */}
          {user && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open user menu">
                <Button
                  onClick={(e) => handleOpenMenu("userMenu", e)}
                  id="user-menu-button"
                  aria-controls={
                    Boolean(anchorEls.userMenu) ? "user-menu" : undefined
                  }
                  aria-haspopup="true"
                  aria-expanded={Boolean(anchorEls.userMenu) ? "true" : "false"}
                  sx={{
                    color: "white",
                    textTransform: "none",
                    py: 0.5,
                    fontSize: "0.875rem",
                  }}
                  endIcon={<KeyboardArrowDownIcon fontSize="small" />}
                  startIcon={
                    <Avatar
                      sx={{ width: 28, height: 28, bgcolor: "secondary.main" }}
                      alt={user.name}
                    >
                      {user.name.charAt(0)}
                    </Avatar>
                  }
                >
                  <Box sx={{ textAlign: "left", ml: 1 }}>
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{ fontSize: "0.8rem" }}
                    >
                      {user.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      component="div"
                      sx={{ fontSize: "0.7rem" }}
                    >
                      {user.project}
                    </Typography>
                  </Box>
                </Button>
              </Tooltip>
              <Menu
                id="user-menu"
                anchorEl={anchorEls.userMenu}
                open={Boolean(anchorEls.userMenu)}
                onClose={() => handleCloseMenu("userMenu")}
                autoFocus={false}
                disableAutoFocusItem
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem onClick={() => handleNavigate("/profile")}>
                  <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={() => handleNavigate("/change-password")}>
                  <LockIcon fontSize="small" sx={{ mr: 1 }} />
                  Change Password
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
