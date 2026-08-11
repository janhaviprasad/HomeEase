import { useEffect, useState } from "react";

import RoleFilterChips from "../components/RoleFilterChips";
import UsersTable from "../components/UsersTable";
import Banner from "../components/Banner";

import {
  getUsers,
  DEFAULT_PAGE_SIZE,
} from "../services/usersApi";

export default function Users() {

  const [users, setUsers] = useState([]);

  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] = useState(1);

  const [totalElements, setTotalElements] =
    useState(0);

  const [role, setRole] = useState("");

  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  const fetchUsers = async () => {

    setIsLoading(true);
    setError(null);

    try {

      // Returns the Spring Page itself — see the envelope note in usersApi.js.
      const pageData = await getUsers({
        page,
        size: DEFAULT_PAGE_SIZE,
        role,
      });

      setUsers(
        Array.isArray(pageData?.content)
          ? pageData.content
          : []
      );

      setTotalElements(
        Number(pageData?.totalElements) || 0
      );

      setTotalPages(
        Number(pageData?.totalPages) || 1
      );

    } catch (err) {

      console.log(err);

      setUsers([]);
      setTotalElements(0);
      setTotalPages(1);

      setError(
        "Could not load users. Check that the Auth Service is running."
      );

    } finally {

      setIsLoading(false);

    }

  };

  useEffect(() => {

    // intentional: refetches on mount and whenever page or role changes; the
    // setters it calls are stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();

    // intentional: fetchUsers reads page and role, both already listed, so it
    // cannot capture a stale value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, role]);

  const handleSelectRole = (nextRole) => {
    setRole(nextRole);
    setPage(0);
  };

  const searchTerm = search.trim().toLowerCase();

  // Client-side only, and only across the current page — there is no search
  // endpoint yet. The hint under the input says so.
  const visibleUsers = searchTerm
    ? users.filter(
        (user) =>
          user.name
            ?.toLowerCase()
            .includes(searchTerm) ||
          user.email
            ?.toLowerCase()
            .includes(searchTerm)
      )
    : users;

  const pageCount = Math.max(totalPages, 1);

  return (

    <div className="p-2">

      <h1 className="text-5xl font-bold">
        Users
      </h1>

      <p className="text-gray-500 mt-2 mb-8">
        Manage customers, providers
        and administrators.
      </p>

      {/* Search */}

      <div className="mb-8">

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search by name or email"
          className="
            w-full
            max-w-md
            bg-white
            border
            rounded-xl
            px-4
            py-3
            outline-none
          "
        />

        <p className="text-gray-500 text-sm mt-2">
          Searches the current page.
        </p>

      </div>

      <RoleFilterChips
        selectedRole={role}
        onSelectRole={handleSelectRole}
      />

      {error && (

        <Banner
          message={error}
          onRetry={fetchUsers}
          onDismiss={() => setError(null)}
        />

      )}

      <UsersTable
        users={visibleUsers}
        searchTerm={searchTerm}
        activeRole={role}
        isLoading={isLoading}
        hasError={Boolean(error)}
      />

      {/* Pagination */}

      <div
        className="
          flex
          justify-between
          items-center
          mt-6
        "
      >

        <p className="text-gray-500">
          Page {page + 1} of {pageCount}

          {/* Suppressed while searching: the client-side filter shrinks the
              numerator per-page while totalElements stays global, so the
              ratio would be misleading. */}
          {!search.trim() && (
            <>
              {" · "}
              Showing {users.length} of{" "}
              {totalElements} users
            </>
          )}
        </p>

        <div className="flex gap-3">

          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0 || isLoading}
            className="
              bg-white
              border
              px-5
              py-2
              rounded-lg
              disabled:opacity-50
            "
          >
            Previous
          </button>

          <button
            onClick={() => setPage(page + 1)}
            disabled={
              page >= pageCount - 1 || isLoading
            }
            className="
              bg-white
              border
              px-5
              py-2
              rounded-lg
              disabled:opacity-50
            "
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
}
