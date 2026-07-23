export default function ApprovedProvidersTable({
  providers,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">

      <h2 className="text-3xl font-bold mb-6">
        Approved Providers
      </h2>

      <table className="w-full">

        <thead>

          <tr className="text-left text-gray-600">

            <th className="pb-4">Name</th>
            <th className="pb-4">Email</th>
            <th className="pb-4">Category</th>
            <th className="pb-4">Experience</th>
            <th className="pb-4">Status</th>

          </tr>

        </thead>

        <tbody>

          {providers.map((provider) => (

            <tr
              key={provider.id}
              className="border-t"
            >

              <td className="py-5">
                {provider.name}
              </td>

              <td>
                {provider.email}
              </td>

              <td>
                {provider.categoryId}
              </td>

              <td>
                {provider.experience} yrs
              </td>

              <td>

                <span
                  className="
                    bg-green-100
                    text-green-700
                    px-3
                    py-1
                    rounded-full
                  "
                >
                  Approved
                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}